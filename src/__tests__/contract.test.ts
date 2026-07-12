import { describe, expect, it } from "bun:test";
import { MpdHlsClient } from "../client";

const baseUrl = process.env.MPD_HLS_BASE_URL;
const username = process.env.MPD_HLS_USERNAME;
const password = process.env.MPD_HLS_PASSWORD;
const contractDescribe =
	baseUrl && username && password ? describe : describe.skip;
const contractBaseUrl = baseUrl ?? "https://example.invalid";
const contractUsername = username ?? "";
const contractPassword = password ?? "";

contractDescribe("MPD-HLS read-only contract", () => {
	const client = new MpdHlsClient({
		baseUrl: contractBaseUrl,
		auth: { username: contractUsername, password: contractPassword },
	});

	it("reads identity and system metrics", async () => {
		const identity = await client.system.whoAmI();
		const metrics = await client.system.metrics();
		const tuning = await client.system.getTuningDefaults();
		expect(identity.username).toBe(contractUsername);
		expect(identity.role.length).toBeGreaterThan(0);
		expect(metrics.ok).toBe(true);
		expect(metrics.version.length).toBeGreaterThan(0);
		expect(Object.keys(tuning).length).toBeGreaterThan(0);
	});

	it("reads representative resource collections", async () => {
		const channels = await client.channels.list({ page: 1, perPage: 1 });
		const groups = await client.groups.list();
		const schedules = await client.schedules.meta();
		const sources = await client.epg.listSources();
		expect(channels.items.length).toBeLessThanOrEqual(1);
		expect(channels.total).toBeGreaterThanOrEqual(channels.items.length);
		expect(Array.isArray(groups.items)).toBe(true);
		expect(typeof schedules.server_time_ms).toBe("number");
		expect(Array.isArray(sources)).toBe(true);
	});
});
