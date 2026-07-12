import { describe, expect, it } from "bun:test";
import { UtilitiesResource } from "../resources/utilities";
import { Transport } from "../transport";

function createTransport(fetch: typeof globalThis.fetch): Transport {
	return new Transport({
		baseUrl: "https://example.test/root",
		auth: { username: "admin", password: "secret" },
		fetch,
	});
}

describe("UtilitiesResource", () => {
	it("URL-encodes the remote URL and returns the response as text", async () => {
		const remoteUrl = "https://media.example/path?q=hello world&lang=中文#part";
		const fetch = Object.assign(
			async (url: string | URL | Request, init?: RequestInit) => {
				expect(String(url)).toBe(
					`https://example.test/root/api/util/fetch-url?url=${encodeURIComponent(remoteUrl)}`,
				);
				expect(init?.method).toBe("GET");
				return new Response("#EXTM3U\nsegment.ts", {
					headers: { "Content-Type": "text/plain" },
				});
			},
			{ preconnect: globalThis.fetch.preconnect },
		) as typeof globalThis.fetch;

		const result = await new UtilitiesResource(createTransport(fetch)).fetchUrl(
			remoteUrl,
		);
		expect(result).toBe("#EXTM3U\nsegment.ts");
	});
});
