import { describe, expect, it } from "bun:test";
import { ScriptsResource } from "../resources/scripts";
import { Transport } from "../transport";
import type { Fetch } from "../types";
import { TEST_SESSION } from "./helpers/session";

const listing = {
	root: "/var/scripts",
	config_root: "/etc/scripts",
	root_exists: true,
	items: [
		{
			path: "dir/file.sh",
			name: "file.sh",
			kind: "file",
			size_bytes: 3,
			modified_ms: 1,
			config_path: "config/file.sh",
			references: [],
		},
	],
	broken_references: [],
	unknown: "retained",
};
const content = {
	path: "dir/file.sh",
	config_path: "config/file.sh",
	content: "abc",
	size_bytes: 3,
	truncated: false,
	modified_ms: 1,
	references: [],
};

function createResource(
	handler: (url: URL, init: RequestInit) => Response | Promise<Response>,
): ScriptsResource {
	const fetch = (async (
		input: string | URL | Request,
		init: RequestInit = {},
	) => handler(new URL(String(input)), init)) as Fetch;
	return new ScriptsResource(
		new Transport({
			baseUrl: "https://example.test/root",
			auth: { username: "admin", password: "secret" },
			fetch,
			session: TEST_SESSION,
		}),
	);
}

describe("ScriptsResource", () => {
	it("lists and reads encoded script paths while preserving unknown fields", async () => {
		const resource = createResource((url, init) => {
			expect(init.method).toBe("GET");
			if (url.pathname.endsWith("/api/scripts")) return Response.json(listing);
			expect(url.pathname).toBe("/root/api/scripts/content");
			expect(url.search).toBe("?path=dir%2Ffile.sh");
			return Response.json(content);
		});
		const result = await resource.list();
		expect(result.unknown).toBe("retained");
		expect((await resource.getContent("dir/file.sh")).content).toBe("abc");
	});

	it("saves and creates scripts with JSON wire bodies", async () => {
		const calls: Array<[string, string, string]> = [];
		const resource = createResource((url, init) => {
			const body = String(init.body);
			calls.push([init.method ?? "", url.pathname, body]);
			return url.pathname.endsWith("/content")
				? Response.json({ size_bytes: 5, modified_ms: 2, extra: true })
				: Response.json({ acknowledged: true });
		});
		await resource.saveContent("a/b", "hello");
		await resource.createDirectory("a/b");
		await resource.createFile("a/b");
		await resource.rename("a/b", "c/d", true);
		expect(calls).toEqual([
			["PUT", "/root/api/scripts/content", '{"path":"a/b","content":"hello"}'],
			["POST", "/root/api/scripts/dir", '{"path":"a/b"}'],
			["POST", "/root/api/scripts/file", '{"path":"a/b","content":""}'],
			[
				"POST",
				"/root/api/scripts/rename",
				'{"from":"a/b","to":"c/d","force":true}',
			],
		]);
	});

	it("uploads multipart files and deletes an encoded path", async () => {
		const resource = createResource(async (url, init) => {
			if (init.method === "DELETE") {
				expect(url.pathname).toBe("/root/api/scripts");
				expect(url.search).toBe("?path=dir%2Ffile.sh&force=true");
				return new Response(null, { status: 204 });
			}
			expect(url.pathname).toBe("/root/api/scripts/upload");
			expect(new Headers(init.headers).has("Content-Type")).toBe(false);
			expect(init.body).toBeInstanceOf(FormData);
			const form = init.body as FormData;
			expect(form.getAll("file")).toHaveLength(2);
			expect(form.get("dir")).toBe("imports");
			expect(form.get("overwrite")).toBe("true");
			return Response.json({
				uploaded: [{ name: "a.sh", extra: true }],
				skipped: [],
			});
		});
		const result = await resource.upload(
			[new File(["a"], "a.sh"), new File(["b"], "b.sh")],
			{ dir: " imports ", overwrite: true },
		);
		expect(result.uploaded[0]).toEqual({ name: "a.sh", extra: true });
		await resource.delete("dir/file.sh", true);
	});
});
