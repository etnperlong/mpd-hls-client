import { describe, expect, it } from "bun:test";
import { XtreamResource } from "../resources/xtream";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

const account = {
	id: "account/1",
	name: "Xtream",
	host: "https://upstream.test",
	username: "viewer",
	refresh_interval_secs: 7200,
	max_connections: 2,
	allowed_user_ids: ["user-1"],
	active_streams: 1,
	channel_count: 10,
	category_count: 2,
	user_agent: null,
	upstream_headers: null,
	upstream_proxy_url: null,
	last_sync_ms: null,
	expires_at_ms: null,
	extra_state: { retained: true },
};
function respond(path: string, method: string): Response {
	if (method === "DELETE" || path.endsWith("/sync"))
		return new Response(null, { status: 204 });
	if (path.endsWith("/accounts") && method === "GET")
		return Response.json([account]);
	if (path.endsWith("/accounts") && method === "POST")
		return Response.json(account);
	if (path.endsWith("/accounts/account%2F1") && method === "PUT")
		return Response.json(account);
	if (path.endsWith("/categories"))
		return Response.json({ items: ["News", "Sports"], extra: true });
	if (path.endsWith("/channels") && method === "GET")
		return Response.json({
			items: [{ id: "ch/1", name: "Channel", extra: true }],
			total: 1,
		});
	if (path.endsWith("/channels/import"))
		return Response.json({ count: 1, extra: true });
	if (path.endsWith("/channels/test"))
		return new Response(
			'{"id":"ch/1","ok":true,"status":200,"latency_ms":12,"first_bytes":4}\n' +
				'{"id":"ch 2","ok":false,"status":502,"latency_ms":30,"error":"bad gateway"}\n',
			{ headers: { "Content-Type": "application/x-ndjson" } },
		);
	if (path.endsWith("/link"))
		return Response.json({
			url: "https://stream.test/live",
			active_streams: 1,
			max_connections: 2,
		});
	if (path.endsWith("/sessions"))
		return Response.json({
			items: [
				{ name: "Channel", playback_mode: "raw", stream_key: "stream/1" },
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
	return { resource: new XtreamResource(transport), requests };
}

describe("XtreamResource", () => {
	it("covers account, channel, import, link, and session operations", async () => {
		const { resource, requests } = setup();
		const input = {
			name: "Xtream",
			host: "https://upstream.test",
			username: "viewer",
			password: "unchanged",
			refresh_interval_secs: 7200,
			max_connections: 2,
			upstream_headers: { "X-Test": "yes" },
			allowed_user_ids: ["user-1"],
			user_agent: "agent",
			upstream_proxy_url: "http://proxy.test",
		};
		const importInput = {
			channel_ids: ["ch/1"],
			group_id: "group-1",
			delivery_mode: "package" as const,
			on_demand: true,
			overwrite_category: true,
			raw_passthrough: false,
		};
		const listed = await resource.listAccounts();
		await resource.createAccount(input);
		await resource.updateAccount("account/1", input);
		await resource.listCategories("account/1");
		await resource.listChannels("account/1", {
			search: "news",
			category: "sports/hd",
			page: 2,
			perPage: 25,
		});
		await resource.importChannels("account/1", importInput);
		const events = [];
		for await (const event of resource.testChannels("account/1", ["ch/1"]))
			events.push(event);
		await resource.channelLink("account/1", "channel / one", "raw");
		await resource.listSessions("account/1");
		await resource.stopSession("account/1", "stream/1");
		await resource.syncAccount("account/1");
		await resource.deleteAccount("account/1");
		expect(listed[0]?.extra_state).toEqual({ retained: true });
		expect(events).toEqual([
			{ id: "ch/1", ok: true, status: 200, latency_ms: 12, first_bytes: 4 },
			{
				id: "ch 2",
				ok: false,
				status: 502,
				latency_ms: 30,
				error: "bad gateway",
			},
		]);
		expect(
			requests.map(
				(r) => `${r.method} ${new URL(r.url).pathname}${new URL(r.url).search}`,
			),
		).toContain(
			"GET /root/api/xtream/accounts/account%2F1/channels?search=news&category=sports%2Fhd&page=2&per_page=25",
		);
		const createRequest = requests[1],
			testRequest = requests[6],
			linkRequest = requests[7];
		if (!createRequest || !testRequest || !linkRequest)
			throw new Error("expected provider requests");
		expect(JSON.parse(await createRequest.clone().text())).toEqual(input);
		expect(JSON.parse(await testRequest.clone().text())).toEqual({
			channel_ids: ["ch/1"],
		});
		expect(new URL(linkRequest.url).search).toBe("?mode=raw");
	});
});
