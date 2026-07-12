import { describe, expect, it } from "bun:test";
import { ChannelsResource } from "../resources/channels";
import { Transport } from "../transport";

function setup() {
	const requests: Request[] = [];
	const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
		const request = new Request(input, init);
		requests.push(request);
		if (request.method === "DELETE") {
			return new Response(null, { status: 204 });
		}
		return Response.json({ ok: true });
	}) as typeof globalThis.fetch;
	const transport = new Transport({
		baseUrl: "https://api.example.test/",
		auth: { username: "user", password: "pass" },
		fetch,
	});
	return { channels: new ChannelsResource(transport), requests };
}

describe("ChannelsResource movement and lifecycle operations", () => {
	it("covers movement, ordering, and lifecycle paths", async () => {
		const { channels, requests } = setup();
		await channels.move("id/1", -1);
		await channels.moveRelative("id/1", "id/2", "before");
		await channels.reorder(["id/2", "id/1"]);
		await channels.reorderPartial(["id/1"], "id/2", "after");
		await channels.start("key/1");
		await channels.stop("key/1", { force: true });
		await channels.restart("key/1");
		await channels.delete("key/1", { force: true });

		expect(new URL(requests[0]?.url ?? "").pathname).toBe(
			"/api/channels/by-id/id%2F1/move",
		);
		expect(await requests[1]?.json()).toEqual({
			anchor_id: "id/2",
			position: "before",
		});
		expect(await requests[2]?.json()).toEqual({
			ids: ["id/2", "id/1"],
			mode: "full",
		});
		expect(await requests[3]?.json()).toEqual({
			ids: ["id/1"],
			mode: "partial",
			anchor_id: "id/2",
			position: "after",
		});
		expect(
			requests
				.slice(4)
				.map(
					(request) =>
						`${request.method} ${new URL(request.url).pathname}${new URL(request.url).search}`,
				),
		).toEqual([
			"POST /api/channels/key%2F1/start",
			"POST /api/channels/key%2F1/stop?force=true",
			"POST /api/channels/key%2F1/restart",
			"DELETE /api/channels/key%2F1?force=true",
		]);
	});
});
