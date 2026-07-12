import type { z } from "zod";
import { encodeBasicAuth } from "./auth.js";
import {
	MpdHlsAuthenticationError,
	MpdHlsHttpError,
	MpdHlsNetworkError,
	MpdHlsResponseValidationError,
	MpdHlsTimeoutError,
} from "./errors.js";
import type { MpdHlsClientOptions, RequestOptions } from "./types.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface TransportRequestOptions extends RequestOptions {
	body?: BodyInit;
}

/** Authenticated HTTP transport shared by all resource clients. */
export class Transport {
	readonly #baseUrl: URL;
	readonly #fetch: typeof globalThis.fetch;
	readonly #headers: Headers;
	readonly #timeoutMs: number;

	constructor(options: MpdHlsClientOptions) {
		this.#baseUrl = new URL(options.baseUrl);
		this.#fetch = options.fetch ?? globalThis.fetch;
		this.#headers = new Headers(options.headers);
		this.#headers.set("Authorization", encodeBasicAuth(options.auth));
		this.#timeoutMs = options.timeoutMs ?? 30_000;
	}

	/** Sends a request and validates its JSON response. */
	async json<T>(
		method: HttpMethod,
		path: string,
		schema: z.ZodType<T>,
		options: TransportRequestOptions = {},
	): Promise<T> {
		const response = await this.response(method, path, options);
		const text = await response.text();
		let value: unknown;
		try {
			value = JSON.parse(text);
		} catch (cause) {
			throw new MpdHlsNetworkError(
				`${method} ${response.url} returned invalid JSON`,
				{ cause },
			);
		}
		const parsed = schema.safeParse(value);
		if (!parsed.success) {
			throw new MpdHlsResponseValidationError(
				method,
				response.url,
				parsed.error.issues,
			);
		}
		return parsed.data;
	}

	/** Sends a request and returns its text response. */
	async text(
		method: HttpMethod,
		path: string,
		options: TransportRequestOptions = {},
	): Promise<string> {
		return (await this.response(method, path, options)).text();
	}

	/** Sends a request whose successful response body is ignored. */
	async void(
		method: HttpMethod,
		path: string,
		options: TransportRequestOptions = {},
	): Promise<void> {
		await this.response(method, path, options);
	}

	/** Sends a request and returns the raw successful response. */
	async response(
		method: HttpMethod,
		path: string,
		options: TransportRequestOptions = {},
	): Promise<Response> {
		const url = new URL(path.replace(/^\//, ""), this.#baseUrlWithSlash());
		const headers = new Headers(this.#headers);
		new Headers(options.headers).forEach((value, key) => {
			headers.set(key, value);
		});
		const timeoutSignal = AbortSignal.timeout(this.#timeoutMs);
		const signal = options.signal
			? AbortSignal.any([options.signal, timeoutSignal])
			: timeoutSignal;
		try {
			const response = await this.#fetch(url, {
				method,
				headers,
				body: options.body,
				signal,
			});
			if (response.ok) return response;
			const responseBody = await response.text();
			const ErrorClass =
				response.status === 401 || response.status === 403
					? MpdHlsAuthenticationError
					: MpdHlsHttpError;
			throw new ErrorClass(
				method,
				url.toString(),
				response.status,
				response.statusText,
				responseBody,
			);
		} catch (cause) {
			if (cause instanceof MpdHlsHttpError) throw cause;
			if (timeoutSignal.aborted && !options.signal?.aborted) {
				throw new MpdHlsTimeoutError(
					`${method} ${url} timed out after ${this.#timeoutMs}ms`,
					{ cause },
				);
			}
			if (options.signal?.aborted) throw cause;
			throw new MpdHlsNetworkError(`${method} ${url} failed`, { cause });
		}
	}

	#baseUrlWithSlash(): URL {
		const value = this.#baseUrl.toString();
		return new URL(value.endsWith("/") ? value : `${value}/`);
	}
}

/** Serializes a JSON request body and supplies its content type. */
export function jsonRequest(value: unknown): TransportRequestOptions {
	return {
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(value),
	};
}
