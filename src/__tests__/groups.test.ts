import { describe, expect, it } from "bun:test";
import { GroupsResource } from "../resources/groups";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

interface RecordedRequest {
	method: string;
	path: string;
	body?: string;
}

function group(id: string, name = "News") {
	return { id, name, channel_count: 2 };
}

function createHarness() {
	const requests: RecordedRequest[] = [];
	const fetch = Object.assign(
		async (input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(String(input));
			const path = `${url.pathname.replace("/root", "")}${url.search}`;
			requests.push({
				method: init?.method ?? "GET",
				path,
				body: init?.body === undefined ? undefined : String(init.body),
			});
			if (init?.method === "DELETE") return new Response(null, { status: 204 });
			if (path === "/api/groups") {
				if (init?.method === "POST") return Response.json(group("created"));
				return Response.json({ items: [{ ...group("g1"), extension: true }] });
			}
			if (path.endsWith("/export")) {
				return Response.json({
					group: { name: "News", tuning: {}, extension: "kept" },
					channels: [{ name: "Channel", extension: 1 }],
				});
			}
			if (path === "/api/groups/import") {
				return Response.json({
					group: group("imported"),
					channels: { items: [{ name: "Channel" }] },
				});
			}
			if (init?.method === "PUT") return Response.json(group("updated"));
			return Response.json({ accepted: true });
		},
		{ preconnect: globalThis.fetch.preconnect },
	) as typeof globalThis.fetch;
	const transport = new Transport({
		baseUrl: "https://example.test/root",
		auth: { username: "admin", password: "secret" },
		fetch,
		session: TEST_SESSION,
	});
	return { resource: new GroupsResource(transport), requests };
}

describe("GroupsResource", () => {
	it("lists, creates, updates, deletes, and exports groups", async () => {
		const { resource, requests } = createHarness();
		const listed = await resource.list();
		expect(listed.items[0]?.extension).toBe(true);
		await resource.create("Sports");
		await resource.update(
			"g/1",
			{ force_manifest_query: true, tuning: { fetch_window: 8 } },
			{ force: true },
		);
		await resource.delete("g/1", { force: true });
		const exported = await resource.export("g/1");
		expect(exported.group.extension).toBe("kept");
		expect(exported.channels[0]?.extension).toBe(1);
		expect(requests).toEqual([
			{ method: "GET", path: "/api/groups", body: undefined },
			{ method: "POST", path: "/api/groups", body: '{"name":"Sports"}' },
			{
				method: "PUT",
				path: "/api/groups/g%2F1?force=true",
				body: '{"force_manifest_query":true,"tuning":{"fetch_window":8}}',
			},
			{
				method: "DELETE",
				path: "/api/groups/g%2F1?force=true",
				body: undefined,
			},
			{ method: "GET", path: "/api/groups/g%2F1/export", body: undefined },
		]);
	});

	it("uses the bundle-confirmed batch and ordering payloads", async () => {
		const { resource, requests } = createHarness();
		await resource.batchDelete(["g1", "g2"], { force: true });
		await resource.move("g1", -2);
		await resource.moveRelative("g1", "g2", "after");
		await resource.reorder(["g2", "g1"]);
		expect(requests).toEqual([
			{
				method: "POST",
				path: "/api/groups/batch-delete?force=true",
				body: '{"group_ids":["g1","g2"]}',
			},
			{ method: "POST", path: "/api/groups/g1/move", body: '{"delta":-2}' },
			{
				method: "POST",
				path: "/api/groups/g1/move-relative",
				body: '{"anchor_id":"g2","position":"after"}',
			},
			{
				method: "POST",
				path: "/api/groups/reorder",
				body: '{"ids":["g2","g1"],"mode":"full"}',
			},
		]);
	});

	it("imports the wire-format export payload", async () => {
		const { resource, requests } = createHarness();
		const result = await resource.import({
			group: { name: "Imported", upstream_proxy_url: "" },
			channels: [{ name: "Channel", source_url: "https://source.test/live" }],
		});
		expect(result.group.id).toBe("imported");
		expect(requests[0]).toEqual({
			method: "POST",
			path: "/api/groups/import",
			body: '{"group":{"name":"Imported","upstream_proxy_url":""},"channels":[{"name":"Channel","source_url":"https://source.test/live"}]}',
		});
	});
});
