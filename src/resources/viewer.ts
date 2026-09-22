import { withQuery } from "../internal/query.js";
import {
	type PlaybackLink,
	playbackLinkSchema,
	type ViewerChannelList,
	type ViewerGroupList,
	viewerChannelListSchema,
	viewerGroupListSchema,
} from "../schemas/viewer.js";
import type { Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Client-only filters accepted by the viewer channel list endpoint. */
export interface ViewerChannelQuery {
	page?: number;
	perPage?: number;
	search?: string;
	groupId?: string;
	status?: string;
}

/** Client for viewer-visible channels, groups, and playback links. */
export class ViewerResource {
	constructor(private readonly transport: Transport) {}

	/** Lists viewer-visible channels with optional pagination and filters. */
	listChannels(
		query: ViewerChannelQuery = {},
		options: RequestOptions = {},
	): Promise<ViewerChannelList> {
		return this.transport.json(
			"GET",
			withQuery("/api/viewer/channels", {
				page: query.page,
				per_page: query.perPage,
				search: query.search,
				group_id: query.groupId,
				status: query.status,
			}),
			viewerChannelListSchema,
			options,
		);
	}

	/** Lists groups visible to the current viewer. */
	listGroups(options: RequestOptions = {}): Promise<ViewerGroupList> {
		return this.transport.json(
			"GET",
			"/api/viewer/groups",
			viewerGroupListSchema,
			options,
		);
	}

	/**
	 * Requests a playback link using a ViewerChannel.channel_id path value.
	 */
	playbackLink(
		channelId: string,
		options: RequestOptions = {},
	): Promise<PlaybackLink> {
		return this.transport.json(
			"POST",
			`/api/viewer/channels/${encodeURIComponent(channelId)}/playback-link`,
			playbackLinkSchema,
			options,
		);
	}
}
