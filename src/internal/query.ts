import type { QueryValue } from "../types.js";

/** Appends defined query values to a relative API path. */
export function withQuery(
	path: string,
	query: Readonly<Record<string, QueryValue>>,
): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== null) {
			search.set(key, String(value));
		}
	}
	const encoded = search.toString();
	return encoded.length === 0 ? path : `${path}?${encoded}`;
}
