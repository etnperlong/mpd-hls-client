import { describe, expect, it } from "bun:test";
import { FontsResource } from "../resources/fonts";
import { Transport } from "../transport";

function createResource(
	handler: (url: URL, init: RequestInit) => Response | Promise<Response>,
): FontsResource {
	const fetch = Object.assign(
		async (input: string | URL | Request, init: RequestInit = {}) =>
			handler(new URL(String(input)), init),
		{ preconnect: globalThis.fetch.preconnect },
	) as typeof globalThis.fetch;
	return new FontsResource(
		new Transport({
			baseUrl: "https://example.test",
			auth: { username: "user", password: "pass" },
			fetch,
		}),
	);
}

const font = {
	id: "font/one",
	display_name: "Primary",
	filename: "primary.ttf",
	vendor_metadata: { family: "Example" },
};

describe("FontsResource", () => {
	it("lists fonts and preserves unknown metadata", async () => {
		const resource = createResource((url, init) => {
			expect(url.pathname).toBe("/api/fonts");
			expect(init.method).toBe("GET");
			return Response.json({ items: [font], revision: 3 });
		});
		const result = await resource.list();
		expect(result.items[0]?.vendor_metadata).toEqual({ family: "Example" });
		expect(result.revision).toBe(3);
	});

	it("renames and deletes an encoded font path", async () => {
		const calls: Array<[string, string, BodyInit | null | undefined]> = [];
		const resource = createResource((url, init) => {
			calls.push([init.method ?? "GET", url.pathname, init.body]);
			return init.method === "DELETE"
				? new Response(null, { status: 204 })
				: Response.json(font);
		});
		await resource.rename("font/one", "Renamed");
		await resource.delete("font/one");
		expect(calls).toEqual([
			["PUT", "/api/fonts/font%2Fone", '{"display_name":"Renamed"}'],
			["DELETE", "/api/fonts/font%2Fone", undefined],
		]);
	});

	it("uploads multipart data without setting Content-Type", async () => {
		const resource = createResource(async (url, init) => {
			expect(url.pathname).toBe("/api/fonts");
			expect(init.method).toBe("POST");
			expect(new Headers(init.headers).has("Content-Type")).toBe(false);
			expect(init.body).toBeInstanceOf(FormData);
			const form = init.body as FormData;
			const file = form.get("file");
			expect(file).toBeInstanceOf(File);
			expect((file as File).name).toBe("custom.ttf");
			expect(await (file as File).text()).toBe("font-bytes");
			expect(form.get("display_name")).toBe("Custom Font");
			return Response.json(font);
		});
		await resource.upload(new Blob(["font-bytes"]), {
			filename: "custom.ttf",
			displayName: "Custom Font",
		});
	});

	it("builds preview queries and returns the raw response", async () => {
		const resource = createResource((url, init) => {
			expect(init.method).toBe("GET");
			expect(url.pathname).toBe("/api/fonts/font%2Fone/preview");
			expect(url.searchParams.get("stroke_color")).toBe("#000000");
			expect(url.searchParams.get("canvas_w")).toBe("1920");
			expect(url.searchParams.get("_")).toBe("123");
			return new Response("png", { headers: { "Content-Type": "image/png" } });
		});
		const path = resource.previewUrl("font/one", {
			text: "A & B",
			stroke_color: "#000000",
			canvas_w: 1920,
			_: 123,
		});
		expect(path).toBe(
			"/api/fonts/font%2Fone/preview?text=A+%26+B&stroke_color=%23000000&canvas_w=1920&_=123",
		);
		const response = await resource.preview("font/one", {
			stroke_color: "#000000",
			canvas_w: 1920,
			_: 123,
		});
		expect(response.headers.get("Content-Type")).toBe("image/png");
		expect(await response.text()).toBe("png");
	});
});
