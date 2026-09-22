import { z } from "zod";
import { itemListSchema, paginatedSchema } from "./common.js";

/** Schema for a selectable MPEG-DASH track. */
const trackSelectorSchema = z.looseObject({
	representation_id: z.string().optional(),
	adaptation_set_id: z.string().optional(),
	index: z.number().int().optional(),
});

/** Schema for per-media-type track selections. */
const trackConfigSchema = z.looseObject({
	video: z.array(trackSelectorSchema),
	audio: z.array(trackSelectorSchema),
	text: z.array(trackSelectorSchema),
});

/** Delivery modes recognized by CharmingStreamer. */
export type ChannelDeliveryMode = "package" | "hls_proxy" | "redirect";

/** Redirect modes recognized by CharmingStreamer. */
export type ChannelRedirectMode = "direct" | "resolve_final";

/** Schema for a channel returned by the management API. */
export const channelSchema = z.looseObject({
	channel_id: z.string(),
	stream_key: z.string(),
	name: z.string(),
	source_url: z.string(),
	license_kid: z.string().nullish(),
	license_key: z.string().nullish(),
	upstream_proxy_url: z.string().nullish(),
	on_demand: z.boolean().optional(),
	auto_start: z.boolean().optional(),
	available_tracks: z.array(z.unknown()).optional(),
	logo: z.string().nullish(),
	group_id: z.string().nullish(),
	group_name: z.string().nullish(),
	redirect_resolve_count: z.number().optional(),
	stream_protocol: z.string().optional(),
	stream_live: z.boolean().optional(),
	status: z.string().optional(),
	playlist_path: z.string().optional(),
	playlist_url: z.string().optional(),
	delivery_mode: z.string(),
	redirect_mode: z.string(),
	track_config: trackConfigSchema.optional(),
	short_source_aggregation: z.boolean().optional(),
});

/** Schema for a channel list response. */
export const channelListSchema = itemListSchema(channelSchema);

/** Schema for a paginated channel list response. */
export const paginatedChannelsSchema = paginatedSchema(channelSchema);

/** Schema for a channel log entry. */
export const channelLogEntrySchema = z.looseObject({
	ts_ms: z.number(),
	level: z.string(),
	target: z.string(),
	message: z.string(),
	fields: z.unknown().optional(),
});

/** Schema for a channel log response. */
export const channelLogsSchema = z.looseObject({
	capacity: z.number().int().nonnegative(),
	logs: z.array(channelLogEntrySchema),
});

/** Schema for an o11 channel import response. */
export const importO11ResultSchema = z.looseObject({
	group: z.looseObject({ name: z.string() }),
	channels: channelListSchema,
});

/** Channel data returned by the management API. */
export type Channel = z.infer<typeof channelSchema>;

/** Paginated channel response. */
export type PaginatedChannels = z.infer<typeof paginatedChannelsSchema>;

/** Channel log response. */
export type ChannelLogs = z.infer<typeof channelLogsSchema>;

/** o11 channel import response. */
export type ImportO11Result = z.infer<typeof importO11ResultSchema>;
