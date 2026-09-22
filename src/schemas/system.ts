import { z } from "zod";

/** Schema for host operating-system metrics. */
export const systemMetricsSchema = z.looseObject({
	hostname: z.string(),
	os: z.string(),
	arch: z.string(),
	kernel: z.string(),
	boot_time_secs: z.number(),
	cpu_count: z.number().int(),
	cpu_model: z.string(),
	cpu_usage_percent: z.number(),
	load_avg_1: z.number(),
	load_avg_5: z.number(),
	load_avg_15: z.number(),
	memory_total_bytes: z.number(),
	memory_used_bytes: z.number(),
	memory_available_bytes: z.number(),
	swap_total_bytes: z.number(),
	swap_used_bytes: z.number(),
	network_total_rx_bytes: z.number(),
	network_total_tx_bytes: z.number(),
});

/** Schema for MPD-HLS process metrics. */
export const processMetricsSchema = z.looseObject({
	pid: z.number().int(),
	cpu_usage_percent: z.number(),
	memory_bytes: z.number(),
	virtual_memory_bytes: z.number(),
	threads: z.number().int(),
});

/** Schema for storage usage metrics. */
export const storageMetricsSchema = z.looseObject({
	path: z.string(),
	total_bytes: z.number(),
	used_bytes: z.number(),
	available_bytes: z.number(),
	stream_bytes: z.number(),
});

/** Schema for aggregate stream-state metrics. */
export const streamMetricsSchema = z.looseObject({
	total: z.number().int(),
	running: z.number().int(),
	starting: z.number().int(),
	retrying: z.number().int(),
	stopped: z.number().int(),
	failed: z.number().int(),
	slow: z.number().int(),
});

/** Schema for aggregate recording metrics. */
export const recordingMetricsSchema = z.looseObject({
	staging_bytes: z.number(),
	output_bytes: z.number(),
	active_count: z.number().int(),
	failed_count: z.number().int(),
	done_count: z.number().int(),
});

/** Schema for an active session whose fields may evolve between server versions. */
export const activeSessionSchema = z.looseObject({});

/** Schema for the system metrics response. */
export const metricsSchema = z.looseObject({
	ok: z.boolean(),
	uptime_secs: z.number(),
	version: z.string(),
	system: systemMetricsSchema,
	process: processMetricsSchema,
	storage: storageMetricsSchema,
	streams: streamMetricsSchema,
	active_sessions: z.array(activeSessionSchema),
	recording: recordingMetricsSchema,
});

/** Schema for the authenticated session owner returned by the API. */
export const whoAmISchema = z.looseObject({
	id: z.string(),
	username: z.string(),
	role: z.string(),
	capabilities: z.array(z.string()),
});

/** Schema for stream tuning defaults. */
export const tuningDefaultsSchema = z.looseObject({
	startup_timeout_ms: z.number().int(),
	playlist_window: z.number().int(),
	fetch_window: z.number().int(),
	publish_delay_segments: z.number().int(),
	short_publish_delay_segments: z.number().int(),
	retain_segments: z.number().int(),
	live_playlist_wait_ms: z.number().int(),
	live_asset_wait_ms: z.number().int(),
	live_file_poll_ms: z.number().int(),
	upstream_mpd_timeout_ms: z.number().int(),
	upstream_segment_timeout_ms: z.number().int(),
	cut_target_secs: z.number(),
	segment_timeline_limit: z.number().int(),
	max_consecutive_refresh_failures: z.number().int(),
	forbidden_403_retry_base_ms: z.number().int(),
	session_inflight_cap: z.number().int(),
	bootstrap_init_stagger_ms: z.number().int(),
	bootstrap_skip_text_media: z.boolean(),
	bootstrap_media_first_count: z.number().int(),
});
/** Schema for the authenticated user's playlist link. */
export const playlistLinkSchema = z.looseObject({
	url: z.string(),
});

/** Playlist link returned by the management API. */
export type PlaylistLink = z.infer<typeof playlistLinkSchema>;

/** System metrics returned by the management API. */
export type Metrics = z.infer<typeof metricsSchema>;

/** Authenticated user details returned by the management API. */
export type WhoAmI = z.infer<typeof whoAmISchema>;

/** Default stream tuning values returned by the management API. */
export type TuningDefaults = z.infer<typeof tuningDefaultsSchema>;
