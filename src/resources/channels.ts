import { withQuery } from "../internal/query.js";
import {
	type Channel,
	channelSchema,
	type ImportO11Result,
	importO11ResultSchema,
	type PaginatedChannels,
	paginatedChannelsSchema,
} from "../schemas/channel.js";
import { unknownObjectSchema } from "../schemas/common.js";
import type { ForceOptions, RequestOptions } from "../types.js";
import { ChannelBatchResource } from "./channels-batch.js";
import {
	type ChannelPatch,
	channelJsonRequest,
	type JsonObject,
} from "./channels-settings.js";

/** Filters and pagination accepted by the channel list endpoint. */
export interface ListChannelsOptions extends RequestOptions {
	page?: number;
	perPage?: number;
	search?: string;
	groupId?: string;
	status?: string;
}

/** Client for MPD-HLS channel management operations. */
export class ChannelsResource extends ChannelBatchResource {
	/** Lists channels with optional pagination and filters. */
	list(options: ListChannelsOptions = {}): Promise<PaginatedChannels> {
		const { page, perPage, search, groupId, status, ...request } = options;
		return this.transport.json(
			"GET",
			withQuery("/api/channels", {
				page,
				per_page: perPage,
				search,
				group_id: groupId,
				status,
			}),
			paginatedChannelsSchema,
			request,
		);
	}

	/** Creates a channel from a wire-format payload. */
	create(
		payload: ChannelPatch,
		options: RequestOptions = {},
	): Promise<Channel> {
		return this.transport.json(
			"POST",
			"/api/channels",
			channelSchema,
			channelJsonRequest(payload, options),
		);
	}

	/** Updates a channel by its stable channel ID. */
	updateById(
		channelId: string,
		patch: ChannelPatch,
		options: ForceOptions = {},
	): Promise<Channel> {
		const { force, ...request } = options;
		return this.transport.json(
			"PUT",
			withQuery(`/api/channels/by-id/${encodeURIComponent(channelId)}`, {
				force,
			}),
			channelSchema,
			channelJsonRequest(patch, request),
		);
	}

	/** Deletes a channel by stream key. */
	delete(streamKey: string, options: ForceOptions = {}): Promise<void> {
		const { force, ...request } = options;
		return this.transport.void(
			"DELETE",
			withQuery(this.path(streamKey), { force }),
			request,
		);
	}

	/** Starts a channel. */
	start(streamKey: string, options: RequestOptions = {}): Promise<JsonObject> {
		return this.transport.json(
			"POST",
			this.path(streamKey, "start"),
			unknownObjectSchema,
			options,
		);
	}

	/** Stops a channel. */
	stop(streamKey: string, options: ForceOptions = {}): Promise<JsonObject> {
		const { force, ...request } = options;
		return this.transport.json(
			"POST",
			withQuery(this.path(streamKey, "stop"), { force }),
			unknownObjectSchema,
			request,
		);
	}

	/** Restarts a channel. */
	restart(
		streamKey: string,
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.transport.json(
			"POST",
			this.path(streamKey, "restart"),
			unknownObjectSchema,
			options,
		);
	}

	/** Exports all channels as an M3U playlist. */
	exportM3u(options: RequestOptions = {}): Promise<string> {
		return this.transport.text("GET", "/api/channels/export.m3u", options);
	}

	/** Imports channels and their group from an o11 configuration payload. */
	importO11(
		payload: Readonly<Record<string, unknown>>,
		options: RequestOptions = {},
	): Promise<ImportO11Result> {
		return this.transport.json(
			"POST",
			"/api/channels/import-o11",
			importO11ResultSchema,
			channelJsonRequest(payload, options),
		);
	}
}
