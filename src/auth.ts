/** Name of the cookie holding the WebUI session identifier. */
export const SESSION_COOKIE_NAME = "mpd_hls_session";

/** Name of the cookie holding the CSRF token. */
export const CSRF_COOKIE_NAME = "mpd_hls_csrf";

/** Name of the header echoing the CSRF cookie on state-changing requests. */
export const CSRF_HEADER_NAME = "X-CSRF-Token";

/** Credentials used to open a management session. */
export interface SessionCredentials {
	username: string;
	password: string;
}

/** Cookie pairs describing an already established session. */
export interface SessionSnapshot {
	cookies: Record<string, string>;
}

/**
 * Extracts `name=value` cookie pairs from a response.
 *
 * Uses `Headers.getSetCookie` when the runtime provides it and falls back to
 * splitting the combined header for older fetch implementations.
 */
export function parseSetCookie(response: Response): [string, string][] {
	const raw =
		typeof response.headers.getSetCookie === "function"
			? response.headers.getSetCookie()
			: splitCombinedSetCookie(response.headers.get("set-cookie"));
	const pairs: [string, string][] = [];
	for (const entry of raw) {
		const [pair] = entry.split(";");
		const separator = pair?.indexOf("=") ?? -1;
		if (!pair || separator <= 0) continue;
		pairs.push([
			pair.slice(0, separator).trim(),
			pair.slice(separator + 1).trim(),
		]);
	}
	return pairs;
}

/** Splits a combined `Set-Cookie` header into individual cookie strings. */
function splitCombinedSetCookie(value: string | null): string[] {
	if (!value) return [];
	const entries: string[] = [];
	let start = 0;
	for (let index = 0; index < value.length; index += 1) {
		if (value[index] !== ",") continue;
		const remainder = value.slice(index + 1);
		if (!/^\s*[^=;,\s]+=/.test(remainder)) continue;
		entries.push(value.slice(start, index));
		start = index + 1;
	}
	entries.push(value.slice(start));
	return entries.map((entry) => entry.trim()).filter(Boolean);
}

/** Mutable cookie jar holding one CharmingStreamer WebUI session. */
export class SessionStore {
	readonly #cookies = new Map<string, string>();

	/** Indicates whether a session cookie is currently held. */
	get authenticated(): boolean {
		return this.#cookies.has(SESSION_COOKIE_NAME);
	}

	/** Returns the CSRF token required by state-changing requests. */
	get csrfToken(): string | undefined {
		return this.#cookies.get(CSRF_COOKIE_NAME);
	}

	/** Returns the `Cookie` header value, or `undefined` when the jar is empty. */
	cookieHeader(): string | undefined {
		if (this.#cookies.size === 0) return undefined;
		return [...this.#cookies]
			.map(([name, value]) => `${name}=${value}`)
			.join("; ");
	}

	/** Stores every cookie the server set on a response. */
	absorb(response: Response): void {
		for (const [name, value] of parseSetCookie(response)) {
			if (value === "") {
				this.#cookies.delete(name);
				continue;
			}
			this.#cookies.set(name, value);
		}
	}

	/** Replaces the jar contents with an externally persisted session. */
	restore(snapshot: SessionSnapshot): void {
		this.clear();
		for (const [name, value] of Object.entries(snapshot.cookies)) {
			this.#cookies.set(name, value);
		}
	}

	/** Returns a serializable copy of the jar contents. */
	snapshot(): SessionSnapshot {
		return { cookies: Object.fromEntries(this.#cookies) };
	}

	/** Discards every stored cookie. */
	clear(): void {
		this.#cookies.clear();
	}
}
