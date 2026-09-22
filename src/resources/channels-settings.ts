import type { z } from "zod";
import { withQuery } from "../internal/query.js";
import {
	type Channel,
	type ChannelLogs,
	channelLogsSchema,
	channelSchema,
} from "../schemas/channel.js";
import { unknownObjectSchema } from "../schemas/common.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { ForceOptions, RequestOptions } from "../types.js";

export type ChannelPatch = Readonly<Record<string, unknown>>;
export type JsonObject = z.infer<typeof unknownObjectSchema>;

export interface ChannelLogOptions extends RequestOptions {
	limit?: number;
	sinceMs?: number;
}

/** Implements channel log and stream-setting operations. */
export class ChannelSettingsResource {
	constructor(protected readonly transport: Transport) {}

	/** Probes a channel and refreshes its detected tracks. */
	probe(streamKey: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void("POST", this.path(streamKey, "probe"), options);
	}

	/** Returns buffered logs for a channel. */
	getLogs(
		streamKey: string,
		options: ChannelLogOptions = {},
	): Promise<ChannelLogs> {
		const { limit, sinceMs, ...request } = options;
		return this.transport.json(
			"GET",
			withQuery(this.path(streamKey, "logs"), { limit, since_ms: sinceMs }),
			channelLogsSchema,
			request,
		);
	}

	/** Clears buffered logs for a channel. */
	clearLogs(streamKey: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void("DELETE", this.path(streamKey, "logs"), options);
	}

	/** Enables or disables on-demand startup. */
	setOnDemand(
		streamKey: string,
		onDemand: boolean,
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.postSetting(
			streamKey,
			"on-demand",
			{ on_demand: onDemand },
			options,
		);
	}

	/** Replaces the selected track configuration. */
	setTrackConfig(
		streamKey: string,
		trackConfig: unknown,
		options: ForceOptions = {},
	): Promise<JsonObject> {
		return this.postSetting(
			streamKey,
			"track-config",
			{ track_config: trackConfig },
			options,
		);
	}

	/** Replaces the selected subtitle formats. */
	setSubtitleFormats(
		streamKey: string,
		subtitleFormats: readonly unknown[],
		options: ForceOptions = {},
	): Promise<JsonObject> {
		return this.postSetting(
			streamKey,
			"subtitle-formats",
			{ subtitle_formats: subtitleFormats },
			options,
		);
	}

	/** Enables or disables embedding audio in video output. */
	setEmbedAudioInVideo(
		streamKey: string,
		enabled: boolean,
		options: ForceOptions = {},
	): Promise<JsonObject> {
		return this.postSetting(
			streamKey,
			"embed-audio-in-video",
			{ embed_audio_in_video: enabled },
			options,
		);
	}

	/** Configures short-source aggregation. */
	setShortSourceAggregation(
		streamKey: string,
		value: boolean | null,
		options: ForceOptions = {},
	): Promise<JsonObject> {
		return this.postSetting(
			streamKey,
			"short-source-aggregation",
			{ short_source_aggregation: value },
			options,
		);
	}

	/** Enables or disables raw source passthrough. */
	setRawPassthrough(
		streamKey: string,
		enabled: boolean,
		options: RequestOptions = {},
	): Promise<JsonObject> {
		return this.postSetting(
			streamKey,
			"raw-passthrough",
			{ raw_passthrough: enabled },
			options,
		);
	}

	protected path(streamKey: string, suffix = ""): string {
		const base = `/api/channels/${encodeURIComponent(streamKey)}`;
		return suffix ? `${base}/${suffix}` : base;
	}

	protected postSetting(
		streamKey: string,
		suffix: string,
		body: unknown,
		options: ForceOptions,
	): Promise<JsonObject> {
		const { force, ...request } = options;
		return this.transport.json(
			"POST",
			withQuery(this.path(streamKey, suffix), { force }),
			unknownObjectSchema,
			jsonOptions(body, request),
		);
	}

	protected channelResult(
		method: "POST" | "PUT",
		path: string,
		body: unknown,
		options: RequestOptions = {},
	): Promise<Channel> {
		return this.transport.json(
			method,
			path,
			channelSchema,
			jsonOptions(body, options),
		);
	}
}
