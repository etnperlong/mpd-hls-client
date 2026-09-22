import { describe, expect, it } from "bun:test";
import { ViewerResource } from "../resources/viewer";
import { Transport } from "../transport";
import type { Fetch } from "../types";
import { TEST_SESSION } from "./helpers/session";

const channel = {
	channel_id: "channel/1",
	name: "Example",
	delivery_mode: "package",
	group_id: "group/1",
	group_name: "Group",
	status: "online",
	future_field: { retained: true },
};
const groups = {
	items: [{ id: "group/1", name: "Group", future_group: true }],
};

function createResource(
	handler: (url: URL, init: RequestInit) => Response | Promise<Response>,
): ViewerResource {
	const fetch = (async (
		input: string | URL | Request,
		init: RequestInit = {},
	) => handler(new URL(String(input)), init)) as Fetch;
	return new ViewerResource(
		new Transport({
			baseUrl: "https://example.test/root",
			auth: { username: "admin", password: "secret" },
			fetch,
			session: TEST_SESSION,
		}),
	);
}

describe("ViewerResource", () => {
	it("lists channels with mapped filters and preserves unknown fields", async () => {
		const resource = createResource((url, init) => {
			expect(init.method).toBe("GET");
			expect(url.pathname).toBe("/root/api/viewer/channels");
			expect(url.search).toBe(
				"?page=2&per_page=5&search=example&group_id=group%2F1&status=online",
			);
			return Response.json({
				items: [channel],
				total: 1,
				page: 2,
				per_page: 5,
			});
		});
		const result = await resource.listChannels({
			page: 2,
			perPage: 5,
			search: "example",
			groupId: "group/1",
			status: "online",
		});
		expect(result.items[0]?.future_field).toEqual({ retained: true });
		expect(result.items[0]?.stream_protocol).toBeUndefined();
	});

	it("lists groups and posts an encoded channel id for playback", async () => {
		const calls: Array<[string, string]> = [];
		const resource = createResource((url, init) => {
			calls.push([init.method ?? "", url.pathname]);
			return url.pathname.endsWith("/groups")
				? Response.json(groups)
				: Response.json({ url: "https://stream.test/play", extra: true });
		});
		const groupResult = await resource.listGroups();
		const link = await resource.playbackLink("channel/1");
		expect(groupResult.items[0]?.future_group).toBe(true);
		expect(link.extra).toBe(true);
		expect(calls).toEqual([
			["GET", "/root/api/viewer/groups"],
			["POST", "/root/api/viewer/channels/channel%2F1/playback-link"],
		]);
	});
});
