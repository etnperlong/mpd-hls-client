import { describe, expect, it } from "bun:test";
import { BrandingResource } from "../resources/branding";
import { Transport } from "../transport";
import type { Fetch } from "../types";
import { TEST_SESSION } from "./helpers/session";

const branding = {
	site_name: "Example",
	icon_url: "/api/branding/icon?v=1",
	custom_icon: true,
	future_field: { retained: true },
};

function createResource(
	handler: (url: URL, init: RequestInit) => Response | Promise<Response>,
): BrandingResource {
	const fetch = (async (
		input: string | URL | Request,
		init: RequestInit = {},
	) => handler(new URL(String(input)), init)) as Fetch;
	return new BrandingResource(
		new Transport({
			baseUrl: "https://example.test/root",
			auth: { username: "admin", password: "secret" },
			fetch,
			session: TEST_SESSION,
		}),
	);
}

describe("BrandingResource", () => {
	it("gets, resets, and preserves unknown branding fields", async () => {
		const resource = createResource((url, init) => {
			expect(init.method).toBe("GET");
			expect(url.pathname).toBe("/root/api/branding");
			return Response.json(branding);
		});
		const result = await resource.get();
		expect(result.future_field).toEqual({ retained: true });
		expect(result.icon_url).toBe("/api/branding/icon?v=1");

		const resetResource = createResource((url, init) => {
			expect(init.method).toBe("DELETE");
			expect(url.pathname).toBe("/root/api/branding");
			return Response.json(branding);
		});
		expect((await resetResource.reset()).site_name).toBe("Example");
	});

	it("updates branding with multipart fields without a manual content type", async () => {
		const resource = createResource(async (url, init) => {
			expect(url.pathname).toBe("/root/api/branding");
			expect(init.method).toBe("PUT");
			expect(new Headers(init.headers).has("Content-Type")).toBe(false);
			expect(init.body).toBeInstanceOf(FormData);
			const form = init.body as FormData;
			expect(form.get("site_name")).toBe("Updated");
			expect(form.get("remove_icon")).toBe("true");
			const icon = form.get("icon");
			expect(icon).toBeInstanceOf(File);
			expect((icon as File).name).toBe("icon.png");
			expect(await (icon as File).text()).toBe("icon-bytes");
			return Response.json(branding);
		});
		await resource.update({
			siteName: "Updated",
			icon: new File(["icon-bytes"], "icon.png"),
			removeIcon: true,
		});
	});
});
