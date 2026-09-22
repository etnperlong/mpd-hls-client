import { z } from "zod";

/** Schema for one IP address receiving redirected channel traffic. */
export const redirectIpSchema = z.looseObject({
	ip: z.string(),
	redirect_count: z.number().int(),
	first_seen_ms: z.number().int(),
	last_seen_ms: z.number().int(),
});

/** Redirect traffic statistics for one IP address. */
export type RedirectIp = z.infer<typeof redirectIpSchema>;

/** Schema for one client represented in channel traffic statistics. */
export const trafficClientSchema = z.looseObject({
	ip: z.string(),
	delivery: z.string(),
	active_connections: z.number().int(),
	username: z.string(),
	last_seen_ms: z.number().int(),
	first_seen_ms: z.number().int(),
	bytes_sent: z.number().int(),
	request_count: z.number().int(),
	user_agent: z.string(),
});

/** Traffic statistics for one client connection group. */
export type TrafficClient = z.infer<typeof trafficClientSchema>;

/** Schema for one channel row in the traffic overview. */
export const trafficChannelRowSchema = z.looseObject({
	stream_key: z.string(),
	name: z.string(),
	delivery_mode: z.string(),
	current_viewers: z.number().int(),
	total_requests: z.number().int(),
	total_bytes_sent: z.number().int(),
	redirect_count: z.number().int(),
	redirect_ip_count: z.number().int(),
});

/** A channel row in the traffic overview. */
export type TrafficChannelRow = z.infer<typeof trafficChannelRowSchema>;

/** Schema for the traffic overview response. */
export const trafficOverviewSchema = z.looseObject({
	tracking_since_ms: z.number().int(),
	active_window_secs: z.number().int(),
	current_viewers: z.number().int(),
	active_channels: z.number().int(),
	total_requests: z.number().int(),
	total_bytes_sent: z.number().int(),
	total_channels: z.number().int(),
	filtered_channels: z.number().int(),
	channels: z.array(trafficChannelRowSchema),
});

/** Aggregate traffic statistics across channels. */
export type TrafficOverview = z.infer<typeof trafficOverviewSchema>;

/** Schema for traffic statistics for one channel. */
export const channelTrafficSchema = z.looseObject({
	tracking_since_ms: z.number().int(),
	active_window_secs: z.number().int(),
	stream_key: z.string(),
	name: z.string(),
	delivery_mode: z.string(),
	current_viewers: z.number().int(),
	total_requests: z.number().int(),
	total_bytes_sent: z.number().int(),
	redirect_count: z.number().int(),
	redirect_ip_count: z.number().int(),
	redirect_ips: z.array(redirectIpSchema),
	clients: z.array(trafficClientSchema),
});

/** Traffic statistics for one channel. */
export type ChannelTraffic = z.infer<typeof channelTrafficSchema>;
