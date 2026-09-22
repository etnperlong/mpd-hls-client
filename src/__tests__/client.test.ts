import { describe, expect, it } from "bun:test";
import { MpdHlsClient } from "../client";
import { TEST_SESSION } from "./helpers/session";

describe("MpdHlsClient", () => {
	it("exposes every management resource", () => {
		const client = new MpdHlsClient({
			baseUrl: "https://example.test",
			auth: { username: "admin", password: "secret" },
			session: TEST_SESSION,
		});
		expect(Object.keys(client).sort()).toEqual([
			"auth",
			"channels",
			"epg",
			"filenameTemplates",
			"fonts",
			"groups",
			"recordings",
			"schedules",
			"subtitleProfiles",
			"system",
			"telegram",
			"users",
			"utilities",
		]);
	});
});
