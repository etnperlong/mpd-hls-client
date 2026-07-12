import { describe, expect, it } from "bun:test";
import { MpdHlsClient } from "../client";

describe("MpdHlsClient", () => {
	it("exposes every management resource", () => {
		const client = new MpdHlsClient({
			baseUrl: "https://example.test",
			auth: { username: "admin", password: "secret" },
		});
		expect(Object.keys(client).sort()).toEqual([
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
