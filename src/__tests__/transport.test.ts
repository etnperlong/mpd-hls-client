import { describe, expect, it } from "bun:test";
import { z } from "zod";
import {
	MpdHlsAuthenticationError,
	MpdHlsResponseValidationError,
} from "../errors";
import { jsonRequest, Transport } from "../transport";
import { createSessionServer, TEST_SESSION } from "./helpers/session";

function createTransport(
	fetch: typeof globalThis.fetch,
	session = false,
): Transport {
	return new Transport({
		baseUrl: "https://example.test/root",
		auth: { username: "admin", password: "secret" },
		fetch,
		...(session ? { session: TEST_SESSION } : {}),
	});
}

describe("Transport session handling", () => {
	it("logs in once and reuses the session cookies", async () => {
		const server = createSessionServer({
			respond: () => Response.json({ username: "admin" }),
		});
		const transport = createTransport(server.fetch);
		const schema = z.object({ username: z.string() });
		await transport.json("GET", "/api/me", schema);
		await transport.json("GET", "/api/me", schema);
		expect(server.logins).toBe(1);
		expect(server.requests.map(({ url }) => url)).toEqual([
			"https://example.test/root/api/auth/login",
			"https://example.test/root/api/me",
			"https://example.test/root/api/me",
		]);
		expect(server.requests[2]?.headers.get("Cookie")).toBe(
			"mpd_hls_session=session-1; mpd_hls_csrf=csrf-1",
		);
	});

	it("sends the CSRF token only on state-changing requests", async () => {
		const server = createSessionServer();
		const transport = createTransport(server.fetch, true);
		await transport.void("GET", "/api/channels");
		await transport.void("POST", "/api/channels", jsonRequest({ name: "c" }));
		expect(server.requests[0]?.headers.get("X-CSRF-Token")).toBeNull();
		expect(server.requests[1]?.headers.get("X-CSRF-Token")).toBe("csrf-value");
		expect(server.requests[1]?.headers.get("Content-Type")).toBe(
			"application/json",
		);
		expect(server.requests[1]?.body).toBe('{"name":"c"}');
	});

	it("re-authenticates once when a stored session expired", async () => {
		const server = createSessionServer({
			expiredResponses: 1,
			respond: () => Response.json({ ok: true }),
		});
		const transport = createTransport(server.fetch, true);
		const result = await transport.json(
			"GET",
			"/api/metrics",
			z.object({ ok: z.boolean() }),
		);
		expect(result.ok).toBe(true);
		expect(server.logins).toBe(1);
		expect(server.requests.map(({ url }) => url)).toEqual([
			"https://example.test/root/api/metrics",
			"https://example.test/root/api/auth/login",
			"https://example.test/root/api/metrics",
		]);
	});

	it("reports rejected credentials as authentication errors", async () => {
		const fetch = Object.assign(
			async () => new Response("invalid credentials", { status: 401 }),
			{ preconnect: globalThis.fetch.preconnect },
		) as typeof globalThis.fetch;
		const promise = createTransport(fetch).text("GET", "/api/me");
		await expect(promise).rejects.toBeInstanceOf(MpdHlsAuthenticationError);
		await promise.catch((error: unknown) => {
			expect((error as MpdHlsAuthenticationError).responseBody).toBe(
				"invalid credentials",
			);
			expect((error as MpdHlsAuthenticationError).url).toBe(
				"https://example.test/root/api/auth/login",
			);
		});
	});

	it("rejects schema mismatches", async () => {
		const server = createSessionServer({
			respond: () => Response.json({ username: 42 }),
		});
		await expect(
			createTransport(server.fetch, true).json(
				"GET",
				"/api/me",
				z.object({ username: z.string() }),
			),
		).rejects.toBeInstanceOf(MpdHlsResponseValidationError);
	});

	it("streams and validates newline-delimited events", async () => {
		const server = createSessionServer({
			respond: () =>
				new Response('{"stage":"start"}\n{"stage":"done"}\n', {
					headers: { "Content-Type": "application/x-ndjson" },
				}),
		});
		const transport = createTransport(server.fetch, true);
		const stages: string[] = [];
		for await (const event of transport.ndjson(
			"POST",
			"/api/xtream/accounts/a/channels/test",
			z.object({ stage: z.string() }),
			jsonRequest({ channel_ids: ["1"] }),
		)) {
			stages.push(event.stage);
		}
		expect(stages).toEqual(["start", "done"]);
		expect(server.requests[0]?.headers.get("Accept")).toBe(
			"application/x-ndjson",
		);
	});
});
