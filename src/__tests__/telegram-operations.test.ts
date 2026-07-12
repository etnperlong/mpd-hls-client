import { describe, expect, it } from "bun:test";
import { TelegramResource } from "../resources/telegram";
import {
	createTelegramFetch,
	createTelegramTransport,
} from "./helpers/telegram";

describe("TelegramResource operations", () => {
	it("posts supplied credentials when testing connectivity", async () => {
		const fetch = createTelegramFetch(async (_url, init) => {
			expect(init?.method).toBe("POST");
			expect(JSON.parse(String(init?.body))).toEqual({
				bot_token: "temporary-token",
				chat_id: 456,
			});
			return Response.json({ ok: false, error: "not connected", retry: true });
		});

		const result = await new TelegramResource(
			createTelegramTransport(fetch),
		).test({ bot_token: "temporary-token", chat_id: 456 });
		expect(result).toEqual({ ok: false, error: "not connected", retry: true });
	});

	it("encodes log limit and before_ms query controls", async () => {
		const fetch = createTelegramFetch(async (url, init) => {
			expect(String(url)).toBe(
				"https://example.test/root/api/telegram/logs?limit=25&before_ms=1700000000000",
			);
			expect(init?.method).toBe("GET");
			return Response.json({
				items: [
					{
						ts_ms: 1_699_999_999_999,
						direction: "out",
						status: "sent",
						kind: "test",
						chat_id: 123,
						text: "message",
						extra: "kept",
					},
				],
			});
		});

		const result = await new TelegramResource(
			createTelegramTransport(fetch),
		).listLogs({ limit: 25, beforeMs: 1_700_000_000_000 });
		expect(result.items[0]?.extra).toBe("kept");
	});
});
