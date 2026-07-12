import type { Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Client for general management API utility operations. */
export class UtilitiesResource {
	constructor(private readonly transport: Transport) {}

	/** Fetches a remote URL through the server and returns its response as text. */
	fetchUrl(url: string, options: RequestOptions = {}): Promise<string> {
		return this.transport.text(
			"GET",
			`/api/util/fetch-url?url=${encodeURIComponent(url)}`,
			options,
		);
	}
}
