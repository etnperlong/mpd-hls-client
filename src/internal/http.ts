import { MpdHlsNetworkError, MpdHlsTimeoutError } from "../errors.js";
import type { Fetch, HttpMethod } from "../types.js";

/** One fully resolved HTTP round trip. */
export interface HttpRequest {
	fetch: Fetch;
	method: HttpMethod;
	url: URL;
	headers: Headers;
	body?: BodyInit;
	signal?: AbortSignal;
	/** Request deadline in milliseconds; omitted for streaming responses. */
	timeoutMs?: number;
}

/** Resolves an API path against the configured base URL. */
export function resolveUrl(baseUrl: URL, path: string): URL {
	const value = baseUrl.toString();
	const base = new URL(value.endsWith("/") ? value : `${value}/`);
	return new URL(path.replace(/^\//, ""), base);
}

/**
 * Sends one request and maps transport failures to client errors.
 *
 * HTTP status codes are left untouched so callers can inspect the response.
 */
export async function sendHttpRequest(request: HttpRequest): Promise<Response> {
	const { fetch, method, url, headers, body, signal, timeoutMs } = request;
	const timeoutSignal =
		timeoutMs === undefined ? undefined : AbortSignal.timeout(timeoutMs);
	let combined = signal ?? timeoutSignal;
	if (signal && timeoutSignal)
		combined = AbortSignal.any([signal, timeoutSignal]);
	try {
		return await fetch(url, { method, headers, body, signal: combined });
	} catch (cause) {
		if (timeoutSignal?.aborted && !signal?.aborted) {
			throw new MpdHlsTimeoutError(
				`${method} ${url} timed out after ${timeoutMs}ms`,
				{ cause },
			);
		}
		if (signal?.aborted) throw cause;
		throw new MpdHlsNetworkError(`${method} ${url} failed`, { cause });
	}
}
