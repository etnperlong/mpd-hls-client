import { describe, expect, it } from "bun:test";
import { ChannelsResource } from "../resources/channels";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

function setup() {
	const requests: Request[] = [];
	const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
		const request = new Request(input, init);
		requests.push(request);
		const path = new URL(request.url).pathname;
		if (path.endsWith("/logs") && request.method === "GET") {
			return Response.json({
				capacity: 100,
				logs: [
					{
						ts_ms: 1,
						level: "info",
						target: "worker",
						message: "ready",
						fields: { pid: 2 },
					},
				],
			});
		}
		if (
			path.endsWith("/probe") ||
			(path.endsWith("/logs") && request.method === "DELETE") ||
			request.method === "DELETE"
		) {
			return new Response(null, { status: 204 });
		}
		return Response.json({ ok: true, extra: "preserved" });
	}) as typeof globalThis.fetch;
	const transport = new Transport({
		baseUrl: "https://api.example.test/",
		auth: { username: "user", password: "pass" },
		fetch,
		session: TEST_SESSION,
	});
	return { channels: new ChannelsResource(transport), requests };
}

describe("ChannelsResource settings", () => {
	it("gets and clears logs and probes with encoded paths", async () => {
		const { channels, requests } = setup();
		const logs = await channels.getLogs("key/one", { limit: 20, sinceMs: 123 });
		await channels.clearLogs("key/one");
		await channels.probe("key/one");

		expect(logs.logs[0]?.fields).toEqual({ pid: 2 });
		expect(new URL(requests[0]?.url ?? "").pathname).toBe(
			"/api/channels/key%2Fone/logs",
		);
		expect(new URL(requests[0]?.url ?? "").search).toBe(
			"?limit=20&since_ms=123",
		);
		expect(requests.map((request) => request.method)).toEqual([
			"GET",
			"DELETE",
			"POST",
		]);
	});

	it("uses the documented setting body keys and force query", async () => {
		const { channels, requests } = setup();
		await channels.setOnDemand("key", true);
		await channels.setTrackConfig(
			"key",
			{ audio: [{ index: 1 }] },
			{ force: true },
		);
		await channels.setSubtitleFormats("key", ["vtt", "srt"], { force: true });
		await channels.setEmbedAudioInVideo("key", true, { force: true });
		await channels.setShortSourceAggregation("key", null, { force: true });
		await channels.setRawPassthrough("key", false);

		expect(
			await Promise.all(requests.map((request) => request.json())),
		).toEqual([
			{ on_demand: true },
			{ track_config: { audio: [{ index: 1 }] } },
			{ subtitle_formats: ["vtt", "srt"] },
			{ embed_audio_in_video: true },
			{ short_source_aggregation: null },
			{ raw_passthrough: false },
		]);
		expect(
			requests
				.slice(1, 5)
				.every((request) => new URL(request.url).search === "?force=true"),
		).toBe(true);
	});
});

describe("ChannelsResource batch and lifecycle operations", () => {
	it("sends batch action and edit payloads", async () => {
		const { channels, requests } = setup();
		await channels.batchStart(["a", "b"]);
		await channels.batchStop(["a"], { force: true });
		await channels.batchProbe(["a"]);
		await channels.batchDelete(["a"], { force: true });
		await channels.batchSetOnDemand(["a"], true);
		await channels.batchSetCategory(["a"], null);
		await channels.batchEdit(["a"], { auto_start: true }, { force: true });

		expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
			"/api/channels/batch-start",
			"/api/channels/batch-stop",
			"/api/channels/batch-probe",
			"/api/channels/batch-delete",
			"/api/channels/batch-on-demand",
			"/api/channels/batch-set-category",
			"/api/channels/batch-edit",
		]);
		expect(await requests[4]?.json()).toEqual({
			channel_ids: ["a"],
			on_demand: true,
		});
		expect(await requests[6]?.json()).toEqual({
			channel_ids: ["a"],
			patch: { auto_start: true },
		});
	});
});
