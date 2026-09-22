import { describe, expect, it } from "bun:test";
import { SubtitleProfilesResource } from "../resources/subtitle-profiles";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

function createResource(
	handler: (url: URL, init: RequestInit) => Response | Promise<Response>,
): SubtitleProfilesResource {
	const fetch = Object.assign(
		async (input: string | URL | Request, init: RequestInit = {}) =>
			handler(new URL(String(input)), init),
		{ preconnect: globalThis.fetch.preconnect },
	) as typeof globalThis.fetch;
	return new SubtitleProfilesResource(
		new Transport({
			baseUrl: "https://example.test",
			auth: { username: "user", password: "pass" },
			fetch,
			session: TEST_SESSION,
		}),
	);
}

const profile = {
	id: "profile/one",
	name: "Default",
	pgs: { font_size: 42, future_setting: "preserved" },
	vtt: { enable_ocr: true },
	server_extension: { enabled: true },
};

describe("SubtitleProfilesResource", () => {
	it("lists profiles and preserves unknown configuration fields", async () => {
		const resource = createResource((url, init) => {
			expect(url.pathname).toBe("/api/subtitle-profiles");
			expect(init.method).toBe("GET");
			return Response.json({ items: [profile], next_cursor: "next" });
		});
		const result = await resource.list();
		expect(result.items[0]?.pgs?.future_setting).toBe("preserved");
		expect(result.items[0]?.server_extension).toEqual({ enabled: true });
		expect(result.next_cursor).toBe("next");
	});

	it("creates profiles with an unmodified snake_case JSON body", async () => {
		const resource = createResource((_url, init) => {
			expect(init.method).toBe("POST");
			expect(new Headers(init.headers).get("Content-Type")).toBe(
				"application/json",
			);
			expect(init.body).toBe('{"name":"Cinema","pgs":{"font_id":"font-one"}}');
			return Response.json(profile);
		});
		await resource.create({
			name: "Cinema",
			pgs: { font_id: "font-one" },
		});
	});

	it("updates, clones, and deletes an encoded profile path", async () => {
		const calls: Array<[string, string, BodyInit | null | undefined]> = [];
		const resource = createResource((url, init) => {
			calls.push([init.method ?? "GET", url.pathname, init.body]);
			return init.method === "DELETE"
				? new Response(null, { status: 204 })
				: Response.json(profile);
		});
		await resource.update("profile/one", {
			pgs: { stroke_color: "#000000", vendor_option: 7 },
		});
		await resource.clone("profile/one");
		await resource.delete("profile/one");
		expect(calls).toEqual([
			[
				"PUT",
				"/api/subtitle-profiles/profile%2Fone",
				'{"pgs":{"stroke_color":"#000000","vendor_option":7}}',
			],
			["POST", "/api/subtitle-profiles/profile%2Fone/clone", undefined],
			["DELETE", "/api/subtitle-profiles/profile%2Fone", undefined],
		]);
	});
});
