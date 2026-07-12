import { SystemResource } from "../../resources/system";
import { Transport } from "../../transport";

export const metricsResponse = {
	ok: true,
	uptime_secs: 123,
	version: "9.9.9-test",
	system: {
		hostname: "media-host",
		os: "Linux",
		arch: "x86_64",
		kernel: "6.12.0",
		boot_time_secs: 1_700_000_000,
		cpu_count: 8,
		cpu_model: "Example CPU",
		cpu_usage_percent: 12.5,
		load_avg_1: 0.5,
		load_avg_5: 0.4,
		load_avg_15: 0.3,
		memory_total_bytes: 1_000,
		memory_used_bytes: 600,
		memory_available_bytes: 400,
		swap_total_bytes: 200,
		swap_used_bytes: 50,
		network_total_rx_bytes: 10_000,
		network_total_tx_bytes: 20_000,
	},
	process: {
		pid: 42,
		cpu_usage_percent: 5.5,
		memory_bytes: 100,
		virtual_memory_bytes: 500,
		threads: 7,
	},
	storage: {
		path: "/var/hls",
		total_bytes: 5_000,
		used_bytes: 2_000,
		available_bytes: 3_000,
		stream_bytes: 1_000,
	},
	streams: {
		total: 5,
		running: 1,
		starting: 1,
		retrying: 1,
		stopped: 1,
		failed: 1,
		slow: 0,
	},
	active_sessions: [
		{ session_id: "future-session", future_state: { value: 1 } },
	],
	recording: {
		staging_bytes: 100,
		output_bytes: 200,
		active_count: 1,
		failed_count: 2,
		done_count: 3,
	},
	future_metric: "preserved",
};

export const whoAmIResponse = {
	username: "operator",
	role: "admin",
	auth_query: "u=operator&p=secret-token",
	future_identity_field: true,
};

export const tuningDefaultsResponse = {
	startup_timeout_ms: 1_001,
	playlist_window: 3,
	fetch_window: 4,
	publish_delay_segments: 2,
	short_publish_delay_segments: 3,
	retain_segments: 20,
	live_playlist_wait_ms: 2_002,
	live_asset_wait_ms: 3_003,
	live_file_poll_ms: 75,
	upstream_mpd_timeout_ms: 4_004,
	upstream_segment_timeout_ms: 5_005,
	cut_target_secs: 6.5,
	segment_timeline_limit: 321,
	max_consecutive_refresh_failures: 7,
	forbidden_403_retry_base_ms: 6_006,
	session_inflight_cap: 8,
	bootstrap_init_stagger_ms: 99,
	bootstrap_skip_text_media: true,
	bootstrap_media_first_count: 4,
	future_tuning_field: "preserved",
};

export function createSystemResource(responses: unknown[]) {
	type FetchParameters = Parameters<typeof globalThis.fetch>;
	const requests: Array<{ url: string; init: FetchParameters[1] }> = [];
	const fetch = Object.assign(
		async (...[input, init]: FetchParameters): Promise<Response> => {
			requests.push({ url: input.toString(), init });
			return new Response(JSON.stringify(responses.shift()), {
				headers: { "Content-Type": "application/json" },
			});
		},
		{ preconnect: globalThis.fetch.preconnect },
	);
	const transport = new Transport({
		baseUrl: "https://example.test/",
		auth: { username: "api-user", password: "api-password" },
		fetch,
	});
	return { resource: new SystemResource(transport), requests };
}
