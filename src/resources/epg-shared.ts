import type {
	EpgRuleAction,
	EpgRuleCondition,
	EpgSourceUrl,
} from "../schemas/epg.js";
import { jsonRequest, type TransportRequestOptions } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Input used to create or replace an EPG source. */
export interface EpgSourceInput {
	name: string;
	urls: EpgSourceUrl[];
	refresh_secs: number;
	priority: number;
	enabled?: boolean;
	[key: string]: unknown;
}

/** Input used to bind one stream to an upstream EPG channel. */
export interface EpgBindingInput {
	stream_key: string;
	source_id: string;
	raw_channel_id: string;
}

/** Search controls for channels exposed by one EPG source. */
export interface EpgSourceChannelQuery {
	search?: string;
	limit?: number;
}

/** Controls for querying programmes over a millisecond time range. */
export interface EpgProgrammeQuery {
	channels?: string[];
	from: number;
	to: number;
	includeDesc?: boolean;
}

/** Backend-defined request payload accepted by programme scheduling. */
export type EpgProgrammeScheduleInput = Readonly<Record<string, unknown>>;

/** Input used to create an EPG keyword rule. */
export interface EpgRuleInput {
	name: string;
	stream_key: string;
	condition: EpgRuleCondition;
	action: EpgRuleAction;
	lead_secs?: number;
	tail_secs?: number;
	enabled?: boolean;
	[key: string]: unknown;
}

/** Fields accepted when updating an EPG keyword rule. */
export type EpgRuleUpdate = Partial<EpgRuleInput>;

/** Merges a JSON body with per-request headers and cancellation options. */
export function epgJsonOptions(
	value: unknown,
	options: RequestOptions,
): TransportRequestOptions {
	const request = jsonRequest(value);
	const headers = new Headers(options.headers);
	new Headers(request.headers).forEach((header, name) => {
		headers.set(name, header);
	});
	return { ...options, ...request, headers };
}
