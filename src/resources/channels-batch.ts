import { withQuery } from "../internal/query.js";
import { type Channel, channelListSchema } from "../schemas/channel.js";
import { unknownObjectSchema } from "../schemas/common.js";
import type { ForceOptions, ItemList, RequestOptions } from "../types.js";
import {
	type ChannelPatch,
	ChannelSettingsResource,
	channelJsonRequest,
	type JsonObject,
} from "./channels-settings.js";

/** Implements channel batch and ordering operations. */
export class ChannelBatchResource extends ChannelSettingsResource {
	/** Creates multiple channels in one request. */
	batchCreate(
		items: readonly ChannelPatch[],
		options: RequestOptions & { autoCreateGroupsFromCategory?: boolean } = {},
	): Promise<ItemList<Channel>> {
		const { autoCreateGroupsFromCategory = false, ...request } = options;
		return this.transport.json(
			"POST",
			"/api/channels/batch",
			channelListSchema,
			channelJsonRequest(
				{
					items,
					auto_create_groups_from_category: autoCreateGroupsFromCategory,
				},
				request,
			),
		);
	}

	/** Starts multiple channels. */
	batchStart(
		channelIds: readonly string[],
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.batchAction("batch-start", channelIds, options);
	}

	/** Stops multiple channels. */
	batchStop(
		channelIds: readonly string[],
		options: ForceOptions = {},
	): Promise<JsonObject> {
		return this.batchAction("batch-stop", channelIds, options);
	}

	/** Probes multiple channels. */
	batchProbe(
		channelIds: readonly string[],
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.batchAction("batch-probe", channelIds, options);
	}

	/** Deletes multiple channels. */
	batchDelete(
		channelIds: readonly string[],
		options: ForceOptions = {},
	): Promise<JsonObject> {
		return this.batchAction("batch-delete", channelIds, options);
	}

	/** Sets on-demand startup for multiple channels. */
	batchSetOnDemand(
		channelIds: readonly string[],
		onDemand: boolean,
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.batchPost(
			"batch-on-demand",
			{ channel_ids: channelIds, on_demand: onDemand },
			options,
		);
	}

	/** Sets the category for multiple channels. */
	batchSetCategory(
		channelIds: readonly string[],
		category: string | null,
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.batchPost(
			"batch-set-category",
			{ channel_ids: channelIds, category },
			options,
		);
	}

	/** Applies a partial update to multiple channels. */
	batchEdit(
		channelIds: readonly string[],
		patch: ChannelPatch,
		options: ForceOptions = {},
	): Promise<JsonObject> {
		return this.batchPost(
			"batch-edit",
			{ channel_ids: channelIds, patch },
			options,
		);
	}

	/** Moves a channel by a relative numeric delta. */
	move(
		channelId: string,
		delta: number,
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.byIdPost(channelId, "move", { delta }, options);
	}

	/** Moves a channel before or after another channel. */
	moveRelative(
		channelId: string,
		anchorId: string,
		position: string,
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.byIdPost(
			channelId,
			"move-relative",
			{ anchor_id: anchorId, position },
			options,
		);
	}

	/** Replaces the complete channel order. */
	reorder(
		ids: readonly string[],
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.batchPost("reorder", { ids, mode: "full" }, options);
	}

	/** Reorders selected channels relative to an anchor. */
	reorderPartial(
		ids: readonly string[],
		anchorId: string,
		position: string,
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.batchPost(
			"reorder",
			{ ids, mode: "partial", anchor_id: anchorId, position },
			options,
		);
	}

	private batchAction(
		suffix: string,
		channelIds: readonly string[],
		options: ForceOptions,
	): Promise<JsonObject> {
		return this.batchPost(suffix, { channel_ids: channelIds }, options);
	}

	private batchPost(
		suffix: string,
		body: unknown,
		options: ForceOptions,
	): Promise<JsonObject> {
		const { force, ...request } = options;
		return this.transport.json(
			"POST",
			withQuery(`/api/channels/${suffix}`, { force }),
			unknownObjectSchema,
			channelJsonRequest(body, request),
		);
	}

	private byIdPost(
		channelId: string,
		suffix: string,
		body: unknown,
		options: RequestOptions,
	): Promise<JsonObject> {
		return this.transport.json(
			"POST",
			`/api/channels/by-id/${encodeURIComponent(channelId)}/${suffix}`,
			unknownObjectSchema,
			channelJsonRequest(body, options),
		);
	}
}
