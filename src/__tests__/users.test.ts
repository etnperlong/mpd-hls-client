import { describe, expect, it } from "bun:test";
import { UsersResource } from "../resources/users";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

interface RecordedRequest {
	method: string;
	path: string;
	body?: string;
}

function user(id: string) {
	return {
		id,
		username: "viewer",
		role: "user",
		web_ui_access: false,
		channel_filter_enabled: true,
		allowed_group_ids: ["g1"],
		allowed_channel_ids: ["c1"],
		playlist_url: "https://example.test/sub/token/playlist.m3u",
		created_at_ms: 1,
		updated_at_ms: 2,
		extension: "kept",
	};
}

function token(value: string) {
	return {
		token: value,
		user_id: "u1",
		purpose: "playlist",
		label: "TV",
		created_at_ms: 3,
		last_seen_at_ms: null,
		expires_at_ms: 4,
		subscription_url: "https://example.test/sub/token/playlist.m3u",
		extension: true,
	};
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
			if (path === "/api/users" && init?.method === "GET") {
				return Response.json({ items: [user("u1")] });
			}
			if (path === "/api/users/channel-options") {
				return Response.json({
					items: [
						{
							channel_id: "c1",
							group_id: "g1",
							group_name: "News",
							name: "Channel",
							extension: "kept",
						},
					],
				});
			}
			if (path.endsWith("/tokens") && init?.method === "GET") {
				return Response.json({ items: [token("listed-token")] });
			}
			if (path.includes("/tokens")) return Response.json(token("secret-token"));
			return Response.json(user("u1"));
		},
		{ preconnect: globalThis.fetch.preconnect },
	) as typeof globalThis.fetch;
	const transport = new Transport({
		baseUrl: "https://example.test/root",
		auth: { username: "admin", password: "secret" },
		fetch,
		session: TEST_SESSION,
	});
	return { resource: new UsersResource(transport), requests };
}

describe("UsersResource", () => {
	it("uses v1.3 user bodies and lists channel options", async () => {
		const { resource, requests } = createHarness();
		const listed = await resource.list();
		expect(listed.items[0]?.playlist_url).toContain("/sub/");
		expect(listed.items[0]?.extension).toBe("kept");
		const options = await resource.listChannelOptions();
		expect(options.items[0]?.extension).toBe("kept");
		await resource.create({
			username: "viewer",
			password: "plain-password",
			role: "user",
			allowed_group_ids: ["g1"],
			channel_filter_enabled: true,
			allowed_channel_ids: ["c1"],
			web_ui_access: false,
		});
		await resource.update("u/1", { role: "admin", allowed_group_ids: [] });
		await resource.updatePassword("u/1", "new-password");
		await resource.delete("u/1");
		expect(requests).toEqual([
			{ method: "GET", path: "/api/users", body: undefined },
			{ method: "GET", path: "/api/users/channel-options", body: undefined },
			{
				method: "POST",
				path: "/api/users",
				body: '{"username":"viewer","password":"plain-password","role":"user","allowed_group_ids":["g1"],"channel_filter_enabled":true,"allowed_channel_ids":["c1"],"web_ui_access":false}',
			},
			{
				method: "PUT",
				path: "/api/users/u%2F1",
				body: '{"role":"admin","allowed_group_ids":[]}',
			},
			{
				method: "POST",
				path: "/api/users/u%2F1/password",
				body: '{"password":"new-password"}',
			},
			{ method: "DELETE", path: "/api/users/u%2F1", body: undefined },
		]);
	});

	it("lists, creates, revokes, and renews tokens", async () => {
		const { resource, requests } = createHarness();
		const listed = await resource.listTokens("u/1");
		expect(listed.items[0]?.user_id).toBe("u1");
		expect(listed.items[0]?.subscription_url).toContain("/sub/");
		const created = await resource.createToken("u/1", {
			label: "TV",
			ttlSecs: 3600,
		});
		expect(created.purpose).toBe("playlist");
		await resource.createToken("u/1", {});
		await resource.revokeToken("u/1", "token/value");
		await resource.renewToken("u/1", "token/value", 7200);
		expect(requests[1]?.body).toBe('{"label":"TV","ttl_secs":3600}');
		expect(requests[2]?.body).toBe("{}");
		expect(requests[4]?.body).toBe('{"ttl_secs":7200}');
		expect(requests[3]?.path).toBe("/api/users/u%2F1/tokens/token%2Fvalue");
	});
});
