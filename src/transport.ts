import type { z } from "zod";
import {
	CSRF_HEADER_NAME,
	type SessionCredentials,
	SessionStore,
} from "./auth.js";
import {
	MpdHlsAuthenticationError,
	MpdHlsHttpError,
	MpdHlsNetworkError,
	MpdHlsResponseValidationError,
} from "./errors.js";
import { resolveUrl, sendHttpRequest } from "./internal/http.js";
import { readNdjsonLines } from "./internal/ndjson.js";
import type {
	Fetch,
	HttpMethod,
	MpdHlsClientOptions,
	RequestOptions,
} from "./types.js";

export interface TransportRequestOptions extends RequestOptions {
	body?: BodyInit;
	/** Keeps the response open for streaming instead of applying the timeout. */
	stream?: boolean;
}

/** Path of the endpoint that exchanges credentials for session cookies. */
export const LOGIN_PATH = "/api/auth/login";

/** Path of the endpoint that invalidates the current session cookies. */
export const LOGOUT_PATH = "/api/auth/logout";

const SAFE_METHODS: Record<string, true> = { GET: true, HEAD: true };

/** Session-authenticated HTTP transport shared by all resource clients. */
export class Transport {
	readonly #baseUrl: URL;
	readonly #fetch: Fetch;
	readonly #headers: Headers;
	readonly #timeoutMs: number;
	readonly #credentials: SessionCredentials;
	readonly #session = new SessionStore();
	#pendingLogin: Promise<void> | undefined;

	constructor(options: MpdHlsClientOptions) {
		this.#baseUrl = new URL(options.baseUrl);
		this.#fetch = options.fetch ?? globalThis.fetch;
		this.#headers = new Headers(options.headers);
		this.#timeoutMs = options.timeoutMs ?? 30_000;
		this.#credentials = options.auth;
		if (options.session) this.#session.restore(options.session);
	}

	/** Exposes the cookie jar so applications can persist and restore sessions. */
	get session(): SessionStore {
		return this.#session;
	}

	/** Opens a session when none is held, or unconditionally when forced. */
	async authenticate(force = false): Promise<void> {
		if (!force && this.#session.authenticated) return;
		if (force) this.#session.clear();
		this.#pendingLogin ??= this.#login().finally(() => {
			this.#pendingLogin = undefined;
		});
		await this.#pendingLogin;
	}

	/** Invalidates the server session and discards the local cookie jar. */
	async endSession(options: RequestOptions = {}): Promise<void> {
		try {
			if (this.#session.authenticated) {
				await this.response("POST", LOGOUT_PATH, options);
			}
		} finally {
			this.#session.clear();
		}
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
		return this.#parse(schema, value, method, response.url);
	}

	/**
	 * Streams a newline-delimited JSON response, validating every event.
	 *
	 * Streaming operations ignore the client timeout because progress events
	 * keep arriving for as long as the server works on the request.
	 */
	async *ndjson<T>(
		method: HttpMethod,
		path: string,
		schema: z.ZodType<T>,
		options: TransportRequestOptions = {},
	): AsyncGenerator<T> {
		const headers = new Headers(options.headers);
		if (!headers.has("Accept")) headers.set("Accept", "application/x-ndjson");
		const response = await this.response(method, path, {
			...options,
			headers,
			stream: true,
		});
		if (!response.body) return;
		for await (const line of readNdjsonLines(response.body)) {
			yield this.#parse(schema, JSON.parse(line), method, response.url);
		}
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

	/** Sends an authenticated request and returns the successful response. */
	async response(
		method: HttpMethod,
		path: string,
		options: TransportRequestOptions = {},
	): Promise<Response> {
		const isLogin = path === LOGIN_PATH;
		if (!isLogin) await this.authenticate();
		let response = await this.#send(method, path, options);
		const replayable = !(options.body instanceof ReadableStream);
		if (response.status === 401 && !isLogin && replayable) {
			await response.body?.cancel();
			await this.authenticate(true);
			response = await this.#send(method, path, options);
		}
		if (response.ok) return response;
		const ErrorClass =
			response.status === 401 || response.status === 403
				? MpdHlsAuthenticationError
				: MpdHlsHttpError;
		throw new ErrorClass(
			method,
			resolveUrl(this.#baseUrl, path).toString(),
			response.status,
			response.statusText,
			await response.text(),
		);
	}

	/** Exchanges the configured credentials for session cookies. */
	async #login(): Promise<void> {
		const response = await this.#send("POST", LOGIN_PATH, {
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(this.#credentials),
		});
		const body = await response.text();
		if (response.ok && this.#session.authenticated) return;
		throw new MpdHlsAuthenticationError(
			"POST",
			resolveUrl(this.#baseUrl, LOGIN_PATH).toString(),
			response.status,
			response.statusText,
			response.ok ? "login did not establish a session cookie" : body,
		);
	}

	/** Performs one round trip, attaching session cookies and the CSRF token. */
	async #send(
		method: HttpMethod,
		path: string,
		options: TransportRequestOptions,
	): Promise<Response> {
		const headers = new Headers(this.#headers);
		new Headers(options.headers).forEach((value, key) => {
			headers.set(key, value);
		});
		const cookie = this.#session.cookieHeader();
		if (cookie) headers.set("Cookie", cookie);
		const csrfToken = this.#session.csrfToken;
		if (csrfToken && !SAFE_METHODS[method]) {
			headers.set(CSRF_HEADER_NAME, csrfToken);
		}
		const response = await sendHttpRequest({
			fetch: this.#fetch,
			method,
			url: resolveUrl(this.#baseUrl, path),
			headers,
			body: options.body,
			signal: options.signal,
			timeoutMs: options.stream ? undefined : this.#timeoutMs,
		});
		this.#session.absorb(response);
		return response;
	}

	#parse<T>(
		schema: z.ZodType<T>,
		value: unknown,
		method: HttpMethod,
		url: string,
	): T {
		const parsed = schema.safeParse(value);
		if (!parsed.success) {
			throw new MpdHlsResponseValidationError(method, url, parsed.error.issues);
		}
		return parsed.data;
	}
}

/** Merges a JSON request body with per-request headers and cancellation. */
export function jsonOptions(
	value: unknown,
	options: RequestOptions = {},
): TransportRequestOptions {
	const request = jsonRequest(value);
	const headers = new Headers(options.headers);
	new Headers(request.headers).forEach((value, name) => {
		headers.set(name, value);
	});
	return { ...options, ...request, headers };
}

/** Serializes a JSON request body and supplies its content type. */
export function jsonRequest(value: unknown): TransportRequestOptions {
	return {
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(value),
	};
}
