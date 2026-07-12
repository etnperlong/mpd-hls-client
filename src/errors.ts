import type { z } from "zod";

/** Base error for all MPD-HLS client failures. */
export class MpdHlsClientError extends Error {
	override readonly name: string = "MpdHlsClientError";
}

/** Raised when the HTTP request cannot reach the server. */
export class MpdHlsNetworkError extends MpdHlsClientError {
	override readonly name: string = "MpdHlsNetworkError";
}

/** Raised when the configured request timeout expires. */
export class MpdHlsTimeoutError extends MpdHlsNetworkError {
	override readonly name: string = "MpdHlsTimeoutError";
}

/** Raised when the server returns a non-successful HTTP status. */
export class MpdHlsHttpError extends MpdHlsClientError {
	override readonly name: string = "MpdHlsHttpError";

	constructor(
		readonly method: string,
		readonly url: string,
		readonly status: number,
		readonly statusText: string,
		readonly responseBody: string,
	) {
		super(`${method} ${url} failed with HTTP ${status} ${statusText}`.trim());
	}
}

/** Raised when the server rejects the configured credentials. */
export class MpdHlsAuthenticationError extends MpdHlsHttpError {
	override readonly name: string = "MpdHlsAuthenticationError";
}

/** Raised when a JSON response does not match its documented schema. */
export class MpdHlsResponseValidationError extends MpdHlsClientError {
	override readonly name: string = "MpdHlsResponseValidationError";

	constructor(
		readonly method: string,
		readonly url: string,
		readonly issues: z.core.$ZodIssue[],
	) {
		super(`${method} ${url} returned an invalid response`);
	}
}
