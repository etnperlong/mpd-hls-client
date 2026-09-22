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
		label: "TV",
		created_at_ms: 3,
		last_seen_at_ms: null,
		expires_at_ms: 4,
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
	it("lists, creates, updates, changes passwords, and deletes users", async () => {
		const { resource, requests } = createHarness();
		const listed = await resource.list();
		expect(listed.items[0]?.playlist_url).toContain("/sub/");
		expect(listed.items[0]?.extension).toBe("kept");
		await resource.create({
			username: "viewer",
			password: "plain-password",
			role: "user",
			allowed_group_ids: ["g1"],
		});
		await resource.update("u/1", {
			role: "admin",
			allowed_group_ids: [],
		});
		await resource.updatePassword("u/1", "new-password");
		await resource.delete("u/1");
		expect(requests).toEqual([
			{ method: "GET", path: "/api/users", body: undefined },
			{
				method: "POST",
				path: "/api/users",
				body: '{"username":"viewer","password":"plain-password","role":"user","allowed_group_ids":["g1"]}',
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

	it("lists, creates, revokes, and renews user tokens", async () => {
		const { resource, requests } = createHarness();
		const listed = await resource.listTokens("u/1");
		expect(listed.items[0]?.token).toBe("listed-token");
		expect(listed.items[0]?.extension).toBe(true);
		const created = await resource.createToken("u/1", {
			label: "TV",
			ttl_secs: 3600,
		});
		expect(created.token).toBe("secret-token");
		await resource.revokeToken("u/1", "token/value");
		const renewed = await resource.renewToken("u/1", "token/value", 7200);
		expect(renewed.token).toBe("secret-token");
		expect(requests).toEqual([
			{ method: "GET", path: "/api/users/u%2F1/tokens", body: undefined },
			{
				method: "POST",
				path: "/api/users/u%2F1/tokens",
				body: '{"label":"TV","ttl_secs":3600}',
			},
			{
				method: "DELETE",
				path: "/api/users/u%2F1/tokens/token%2Fvalue",
				body: undefined,
			},
			{
				method: "PATCH",
				path: "/api/users/u%2F1/tokens/token%2Fvalue",
				body: '{"ttl_secs":7200}',
			},
		]);
	});
});
