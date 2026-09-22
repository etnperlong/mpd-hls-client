import { z } from "zod";
import { itemListSchema, paginatedSchema } from "./common.js";

/** Schema for a channel visible to a viewer. */
export const viewerChannelSchema = z.looseObject({
	channel_id: z.string(),
	name: z.string(),
	delivery_mode: z.string(),
	group_id: z.string(),
	group_name: z.string(),
	status: z.string(),
	stream_protocol: z.string().optional(),
	stream_live: z.boolean().optional(),
});

/** A channel visible to a viewer. */
export type ViewerChannel = z.infer<typeof viewerChannelSchema>;

/** Schema for the paginated viewer channel list response. */
export const viewerChannelListSchema = paginatedSchema(viewerChannelSchema);

/** Paginated channels visible to a viewer. */
export type ViewerChannelList = z.infer<typeof viewerChannelListSchema>;

/** Schema for a viewer-visible group. */
export const viewerGroupSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
});

/** A group visible to a viewer. */
export type ViewerGroup = z.infer<typeof viewerGroupSchema>;

/** Schema for the viewer group list response. */
export const viewerGroupListSchema = itemListSchema(viewerGroupSchema);

/** Viewer-visible groups response. */
export type ViewerGroupList = z.infer<typeof viewerGroupListSchema>;

/** Schema for a generated viewer playback link. */
export const playbackLinkSchema = z.looseObject({
	url: z.string(),
});

/** A generated viewer playback link. */
export type PlaybackLink = z.infer<typeof playbackLinkSchema>;
