import { describe, expect, it } from "bun:test";
import { StalkerResource } from "../resources/stalker";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

const account = {
	id: "portal / id",
	name: "Stalker",
	host: "https://portal.test",
	mac: "00:1A:79:aa:bb:cc",
	refresh_interval_secs: 7200,
	max_connections: 1,
	allowed_user_ids: [],
	active_streams: 0,
	channel_count: 4,
	category_count: 1,
	user_agent: null,
	upstream_headers: {},
	upstream_proxy_url: null,
	last_sync_ms: null,
	expires_at_ms: null,
	unknown_field: "preserved",
};

function respond(path: string, method: string): Response {
	if (method === "DELETE" || path.endsWith("/sync"))
		return new Response(null, { status: 204 });
	if (path.endsWith("/api/stalker/accounts") && method === "GET")
		return Response.json([account]);
	if (path.endsWith("/api/stalker/accounts") && method === "POST")
		return Response.json(account);
	if (
		path.endsWith("/api/stalker/accounts/portal%20%2F%20id") &&
		method === "PUT"
	)
		return Response.json(account);
	if (path.endsWith("/categories"))
		return Response.json({ items: ["Movies"], extra: true });
	if (path.endsWith("/channels") && method === "GET")
		return Response.json({
			items: [
				{ id: "channel / one", name: "Channel", logo: null, category: null },
			],
			total: 1,
		});
	if (path.endsWith("/channels/import")) return Response.json({ count: 1 });
	if (path.endsWith("/channels/test"))
		return new Response(
			'{"id":"channel / one","ok":true,"latency_ms":8,"first_bytes":9}\n' +
				'{"id":"channel two","ok":false,"latency_ms":20,"error":"timeout"}\n',
			{ headers: { "Content-Type": "application/x-ndjson" } },
		);
	if (path.endsWith("/link"))
		return Response.json({
			url: "https://stream.test/raw",
			active_streams: 0,
			max_connections: 1,
		});
	if (path.endsWith("/sessions"))
		return Response.json({
			items: [
				{ name: "Channel", playback_mode: "hls", stream_key: "stream key" },
			],
		});
	throw new Error(`Unhandled ${method} ${path}`);
}

function setup() {
	const requests: Request[] = [];
	const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
		const request = new Request(input, init);
		requests.push(request);
		return respond(new URL(request.url).pathname, request.method);
	}) as typeof globalThis.fetch;
	const transport = new Transport({
		baseUrl: "https://example.test/root",
		auth: { username: "admin", password: "secret" },
		fetch,
		session: TEST_SESSION,
	});
	return { resource: new StalkerResource(transport), requests };
}

describe("StalkerResource", () => {
	it("covers provider paths, wire bodies, streams, and preserved fields", async () => {
		const { resource, requests } = setup();
		const input = {
			name: "Stalker",
			host: "https://portal.test",
			mac: "00:1A:79:aa:bb:cc",
			refresh_interval_secs: 7200,
			max_connections: 1,
			upstream_headers: { "X-Test": "yes" },
			allowed_user_ids: [],
		};
		const importInput = {
			channel_ids: ["channel / one"],
			group_id: "group-1",
			delivery_mode: "hls_proxy" as const,
			overwrite_category: true,
			raw_passthrough: false,
		};
		const listed = await resource.listAccounts();
		await resource.createAccount(input);
		await resource.updateAccount("portal / id", input);
		await resource.listCategories("portal / id");
		await resource.listChannels("portal / id", {
			search: "news",
			category: "kids / hd",
			page: 3,
			perPage: 50,
		});
		await resource.importChannels("portal / id", importInput);
		const events = [];
		for await (const event of resource.testChannels("portal / id", [
			"channel / one",
		]))
			events.push(event);
		await resource.channelLink("portal / id", "channel / one");
		await resource.listSessions("portal / id");
		await resource.stopSession("portal / id", "stream key");
		await resource.syncAccount("portal / id");
		await resource.deleteAccount("portal / id");
		expect(listed[0]?.unknown_field).toBe("preserved");
		expect(events).toHaveLength(2);
		expect(
			requests.map(
				(request) =>
					`${request.method} ${new URL(request.url).pathname}${new URL(request.url).search}`,
			),
		).toContain(
			"GET /root/api/stalker/accounts/portal%20%2F%20id/channels?search=news&category=kids+%2F+hd&page=3&per_page=50",
		);
		const importRequest = requests[5];
		const linkRequest = requests[7];
		if (!importRequest || !linkRequest) {
			throw new Error("expected provider requests");
		}
		expect(JSON.parse(await importRequest.clone().text())).toEqual(importInput);
		expect(new URL(linkRequest.url).search).toBe("?mode=hls");
	});
});
