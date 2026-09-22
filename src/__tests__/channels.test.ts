import { describe, expect, it } from "bun:test";
import { ChannelsResource } from "../resources/channels";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

const channel = {
	channel_id: "channel/1",
	stream_key: "stream key",
	name: "Example",
	source_url: "https://example.test/live.mpd",
	license_key: "secret",
	delivery_mode: "package",
	redirect_mode: "direct",
	track_config: {
		video: [{}],
		audio: [{ adaptation_set_id: "a1" }],
		text: [],
	},
	short_source_aggregation: true,
	future_field: { enabled: true },
};

function setup() {
	const requests: Request[] = [];
	const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
		const request = new Request(input, init);
		requests.push(request);
		const path = new URL(request.url).pathname;
		if (path.endsWith("export.m3u")) {
			return new Response("#EXTM3U\n", { status: 200 });
		}
		if (path.endsWith("import-o11")) {
			return Response.json({
				group: { name: "Imported", extra: 1 },
				channels: { items: [channel] },
			});
		}
		if (path.endsWith("/batch")) {
			return Response.json({ items: [channel], extra: true });
		}
		if (path === "/api/channels" && request.method === "GET") {
			return Response.json({
				items: [channel],
				total: 1,
				page: 2,
				per_page: 25,
				extra: true,
			});
		}
		return Response.json(channel);
	}) as typeof globalThis.fetch;
	const transport = new Transport({
		baseUrl: "https://api.example.test/",
		auth: { username: "user", password: "pass" },
		fetch,
		session: TEST_SESSION,
	});
	return { channels: new ChannelsResource(transport), requests };
}

describe("ChannelsResource core operations", () => {
	it("lists with pagination and filters while preserving response fields", async () => {
		const { channels, requests } = setup();
		const result = await channels.list({
			page: 2,
			perPage: 25,
			search: "news & sport",
			groupId: "group/1",
			status: "running",
		});

		expect(result.items[0]?.license_key).toBe("secret");
		expect(result.items[0]?.future_field).toEqual({ enabled: true });
		expect(result.items[0]?.delivery_mode).toBe("package");
		expect(result.items[0]?.redirect_mode).toBe("direct");
		expect(result.items[0]?.track_config?.audio[0]?.adaptation_set_id).toBe(
			"a1",
		);
		expect(result.items[0]?.short_source_aggregation).toBe(true);
		expect(new URL(requests[0]?.url ?? "").searchParams).toEqual(
			new URLSearchParams({
				page: "2",
				per_page: "25",
				search: "news & sport",
				group_id: "group/1",
				status: "running",
			}),
		);
	});

	it("creates, batch creates, and updates with wire-format bodies", async () => {
		const { channels, requests } = setup();
		await channels.create({
			stream_key: "one",
			source_url: "https://one.test",
		});
		await channels.batchCreate([{ stream_key: "two" }], {
			autoCreateGroupsFromCategory: true,
		});
		await channels.updateById(
			"channel/1",
			{ source_url: "https://two.test" },
			{ force: true },
		);

		expect(await requests[0]?.json()).toEqual({
			stream_key: "one",
			source_url: "https://one.test",
		});
		expect(await requests[1]?.json()).toEqual({
			items: [{ stream_key: "two" }],
			auto_create_groups_from_category: true,
		});
		expect(new URL(requests[2]?.url ?? "").pathname).toBe(
			"/api/channels/by-id/channel%2F1",
		);
		expect(new URL(requests[2]?.url ?? "").search).toBe("?force=true");
	});

	it("exports text and validates the o11 import result", async () => {
		const { channels, requests } = setup();
		expect(await channels.exportM3u()).toBe("#EXTM3U\n");
		const result = await channels.importO11({ Name: "Imported", Streams: [] });

		expect(result.group.name).toBe("Imported");
		expect(result.channels.items[0]?.future_field).toEqual({ enabled: true });
		expect(await requests[1]?.json()).toEqual({
			Name: "Imported",
			Streams: [],
		});
	});
});
