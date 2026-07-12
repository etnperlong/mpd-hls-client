import { describe, expect, it } from "bun:test";
import { TelegramResource } from "../resources/telegram";
import {
	createTelegramFetch,
	createTelegramTransport,
	telegramConfig,
	updateInput,
} from "./helpers/telegram";

describe("TelegramResource configuration", () => {
	it("gets and loosely validates the nested config", async () => {
		const fetch = createTelegramFetch(async (input, init) => {
			expect(String(input)).toBe(
				"https://example.test/root/api/telegram/config",
			);
			expect(init?.method).toBe("GET");
			return Response.json(telegramConfig());
		});

		const result = await new TelegramResource(
			createTelegramTransport(fetch),
		).getConfig();
		expect(result.server_extension).toEqual({ enabled: true });
		expect(result.alerts.nested_extension).toBe("kept");
	});

	it("updates config with a JSON PUT body", async () => {
		const input = updateInput();
		const fetch = createTelegramFetch(async (url, init) => {
			expect(String(url)).toBe("https://example.test/root/api/telegram/config");
			expect(init?.method).toBe("PUT");
			expect(new Headers(init?.headers).get("Content-Type")).toBe(
				"application/json",
			);
			expect(JSON.parse(String(init?.body))).toEqual(input);
			return Response.json(telegramConfig());
		});

		await new TelegramResource(createTelegramTransport(fetch)).updateConfig(
			input,
		);
	});
});
