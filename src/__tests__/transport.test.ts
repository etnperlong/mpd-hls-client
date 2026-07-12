import { describe, expect, it } from "bun:test";
import { z } from "zod";
import {
	MpdHlsAuthenticationError,
	MpdHlsResponseValidationError,
} from "../errors";
import { jsonRequest, Transport } from "../transport";

function createTransport(fetch: typeof globalThis.fetch): Transport {
	return new Transport({
		baseUrl: "https://example.test/root",
		auth: { username: "admin", password: "secret" },
		fetch,
	});
}

describe("Transport", () => {
	it("authenticates and validates JSON responses", async () => {
		const fetch = Object.assign(
			async (input: string | URL | Request, init?: RequestInit) => {
				expect(String(input)).toBe("https://example.test/root/api/me");
				expect(new Headers(init?.headers).get("Authorization")).toBe(
					"Basic YWRtaW46c2VjcmV0",
				);
				return Response.json({ username: "admin" });
			},
			{ preconnect: globalThis.fetch.preconnect },
		) as typeof globalThis.fetch;
		const result = await createTransport(fetch).json(
			"GET",
			"/api/me",
			z.object({ username: z.string() }),
		);
		expect(result.username).toBe("admin");
	});

	it("serializes JSON request bodies", async () => {
		const fetch = Object.assign(
			async (_input: string | URL | Request, init?: RequestInit) => {
				expect(new Headers(init?.headers).get("Content-Type")).toBe(
					"application/json",
				);
				expect(init?.body).toBe('{"name":"channel"}');
				return new Response(null, { status: 204 });
			},
			{ preconnect: globalThis.fetch.preconnect },
		) as typeof globalThis.fetch;
		await createTransport(fetch).void(
			"POST",
			"/api/channels",
			jsonRequest({ name: "channel" }),
		);
	});

	it("preserves authentication error response bodies", async () => {
		const fetch = Object.assign(
			async () => new Response("unauthorized", { status: 401 }),
			{ preconnect: globalThis.fetch.preconnect },
		) as typeof globalThis.fetch;
		const promise = createTransport(fetch).text("GET", "/api/me");
		await expect(promise).rejects.toBeInstanceOf(MpdHlsAuthenticationError);
		await promise.catch((error: unknown) => {
			expect((error as MpdHlsAuthenticationError).responseBody).toBe(
				"unauthorized",
			);
		});
	});

	it("rejects schema mismatches", async () => {
		const fetch = Object.assign(async () => Response.json({ username: 42 }), {
			preconnect: globalThis.fetch.preconnect,
		}) as typeof globalThis.fetch;
		await expect(
			createTransport(fetch).json(
				"GET",
				"/api/me",
				z.object({ username: z.string() }),
			),
		).rejects.toBeInstanceOf(MpdHlsResponseValidationError);
	});
});
