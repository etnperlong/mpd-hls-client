import { describe, expect, it } from "bun:test";
import { FilenameTemplatesResource } from "../resources/filename-templates";
import { Transport } from "../transport";

function createResource(
	handler: (url: URL, init: RequestInit) => Response | Promise<Response>,
): FilenameTemplatesResource {
	const fetch = Object.assign(
		async (input: string | URL | Request, init: RequestInit = {}) =>
			handler(new URL(String(input)), init),
		{ preconnect: globalThis.fetch.preconnect },
	) as typeof globalThis.fetch;
	return new FilenameTemplatesResource(
		new Transport({
			baseUrl: "https://example.test",
			auth: { username: "user", password: "pass" },
			fetch,
		}),
	);
}

const template = {
	id: "template/one",
	name: "Episode",
	body: "{program.title}/{datetime}",
	server_extension: true,
};

describe("FilenameTemplatesResource", () => {
	it("lists templates and preserves unknown fields", async () => {
		const resource = createResource((url, init) => {
			expect(url.pathname).toBe("/api/filename-templates");
			expect(init.method).toBe("GET");
			return Response.json({ items: [template], version: 2 });
		});
		const result = await resource.list();
		expect(result.items[0]?.server_extension).toBe(true);
		expect(result.version).toBe(2);
	});

	it("creates a template with a snake_case wire payload", async () => {
		const resource = createResource((_url, init) => {
			expect(init.method).toBe("POST");
			expect(init.body).toBe(
				'{"name":"Episode","body":"{program.title}/{datetime}","output_dir":"shows"}',
			);
			return Response.json(template);
		});
		await resource.create({
			name: "Episode",
			body: "{program.title}/{datetime}",
			output_dir: "shows",
		});
	});

	it("updates and deletes an encoded template path", async () => {
		const calls: Array<[string, string, BodyInit | null | undefined]> = [];
		const resource = createResource((url, init) => {
			calls.push([init.method ?? "GET", url.pathname, init.body]);
			return init.method === "DELETE"
				? new Response(null, { status: 204 })
				: Response.json(template);
		});
		await resource.update("template/one", { body: "{channel.name}" });
		await resource.delete("template/one");
		expect(calls).toEqual([
			[
				"PUT",
				"/api/filename-templates/template%2Fone",
				'{"body":"{channel.name}"}',
			],
			["DELETE", "/api/filename-templates/template%2Fone", undefined],
		]);
	});
});
