import type { SessionCredentials, SessionSnapshot } from "./auth.js";

/** HTTP implementation accepted by the client. */
export type Fetch = typeof globalThis.fetch;

/** HTTP methods used by the management API. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Query values supported by the CharmingStreamer API. */
export type QueryValue = string | number | boolean | null | undefined;

/** Client construction options. */
export interface MpdHlsClientOptions {
	baseUrl: string | URL;
	auth: SessionCredentials;
	/** Previously persisted session cookies reused instead of logging in. */
	session?: SessionSnapshot;
	fetch?: Fetch;
	headers?: HeadersInit;
	timeoutMs?: number;
}

/** Options accepted by every API operation. */
export interface RequestOptions {
	signal?: AbortSignal;
	headers?: HeadersInit;
}

/** Options accepted by operations that can force an update. */
export interface ForceOptions extends RequestOptions {
	force?: boolean;
}

/** A generic response containing an item list. */
export interface ItemList<T> {
	items: T[];
}

/** A generic paginated response. */
export interface Paginated<T> extends ItemList<T> {
	total: number;
	page: number;
	per_page: number;
}
