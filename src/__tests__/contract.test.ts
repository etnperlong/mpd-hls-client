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

contractDescribe("CharmingStreamer read-only contract", () => {
	const client = new MpdHlsClient({
		baseUrl: contractBaseUrl,
		auth: { username: contractUsername, password: contractPassword },
	});

	it("opens a session and reads identity and system metrics", async () => {
		const identity = await client.auth.login();
		const metrics = await client.system.metrics();
		const tuning = await client.system.getTuningDefaults();
		expect(identity.username).toBe(contractUsername);
		expect(identity.capabilities.length).toBeGreaterThan(0);
		expect(client.auth.snapshot().cookies.mpd_hls_session).toBeString();
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

	it("reads the console domains added in 1.3.0", async () => {
		const branding = await client.branding.get();
		const traffic = await client.traffic.overview({ activeOnly: false });
		const viewerGroups = await client.viewer.listGroups();
		const scripts = await client.scripts.list();
		const playlist = await client.system.playlistLink();
		expect(branding.site_name.length).toBeGreaterThan(0);
		expect(traffic.current_viewers).toBeGreaterThanOrEqual(0);
		expect(Array.isArray(traffic.channels)).toBe(true);
		expect(Array.isArray(viewerGroups.items)).toBe(true);
		expect(Array.isArray(scripts.items)).toBe(true);
		expect(playlist.url.length).toBeGreaterThan(0);
	});

	it("reads provider accounts and user channel options", async () => {
		const xtream = await client.xtream.listAccounts();
		const stalker = await client.stalker.listAccounts();
		const options = await client.users.listChannelOptions();
		expect(Array.isArray(xtream)).toBe(true);
		expect(Array.isArray(stalker)).toBe(true);
		expect(Array.isArray(options.items)).toBe(true);
	});
});
