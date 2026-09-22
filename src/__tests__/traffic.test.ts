import { describe, expect, it } from "bun:test";
import { TrafficResource } from "../resources/traffic";
import { Transport } from "../transport";
import type { Fetch } from "../types";
import { TEST_SESSION } from "./helpers/session";

const overview = {
	tracking_since_ms: 1,
	active_window_secs: 60,
	current_viewers: 2,
	active_channels: 1,
	total_requests: 4,
	total_bytes_sent: 5,
	total_channels: 3,
	filtered_channels: 1,
	channels: [
		{
			stream_key: "stream/key",
			name: "Example",
			delivery_mode: "package",
			current_viewers: 2,
			total_requests: 4,
			total_bytes_sent: 5,
			redirect_count: 0,
			redirect_ip_count: 0,
			unknown_row: true,
		},
	],
	unknown_overview: "retained",
};
const channel = {
	tracking_since_ms: 1,
	active_window_secs: 60,
	stream_key: "stream/key",
	name: "Example",
	delivery_mode: "package",
	current_viewers: 2,
	total_requests: 4,
	total_bytes_sent: 5,
	redirect_count: 0,
	redirect_ip_count: 0,
	redirect_ips: [
		{ ip: "192.0.2.1", redirect_count: 1, first_seen_ms: 1, last_seen_ms: 2 },
	],
	clients: [
		{
			ip: "192.0.2.2",
			delivery: "raw",
			active_connections: 1,
			username: "admin",
			last_seen_ms: 2,
			first_seen_ms: 1,
			bytes_sent: 3,
			request_count: 4,
			user_agent: "test",
		},
	],
	unknown_channel: { retained: true },
};

function createResource(
	handler: (url: URL, init: RequestInit) => Response | Promise<Response>,
): TrafficResource {
	const fetch = (async (
		input: string | URL | Request,
		init: RequestInit = {},
	) => handler(new URL(String(input)), init)) as Fetch;
	return new TrafficResource(
		new Transport({
			baseUrl: "https://example.test/root",
			auth: { username: "admin", password: "secret" },
			fetch,
			session: TEST_SESSION,
		}),
	);
}

describe("TrafficResource", () => {
	it("serializes camel-case overview filters including false", async () => {
		const resource = createResource((url, init) => {
			expect(init.method).toBe("GET");
			expect(init.body).toBeUndefined();
			expect(url.pathname).toBe("/root/api/traffic");
			expect(url.search).toBe(
				"?search=example&active_only=false&page=2&per_page=10",
			);
			return Response.json(overview);
		});
		const result = await resource.overview({
			search: "example",
			activeOnly: false,
			page: 2,
			perPage: 10,
		});
		expect(result.unknown_overview).toBe("retained");
		expect(result.channels[0]?.unknown_row).toBe(true);
	});

	it("encodes stream keys and preserves channel traffic fields", async () => {
		const resource = createResource((url, init) => {
			expect(init.method).toBe("GET");
			expect(url.pathname).toBe("/root/api/channels/stream%2Fkey/traffic");
			return Response.json(channel);
		});
		const result = await resource.channel("stream/key");
		expect(result.unknown_channel).toEqual({ retained: true });
		expect(result.clients[0]?.user_agent).toBe("test");
	});
});
