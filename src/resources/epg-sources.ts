import { withQuery } from "../internal/query.js";
import {
	type EpgBinding,
	type EpgBindingCandidate,
	type EpgDisplayableChannel,
	type EpgSource,
	type EpgSourceChannel,
	epgBindingCandidateListSchema,
	epgBindingListSchema,
	epgBindingSchema,
	epgDisplayableChannelListSchema,
	epgSourceChannelListSchema,
	epgSourceListSchema,
	epgSourceSchema,
} from "../schemas/epg.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";
import type {
	EpgBindingInput,
	EpgSourceChannelQuery,
	EpgSourceInput,
} from "./epg-shared.js";

/** Client for EPG source and binding operations. */
export class EpgSourcesResource {
	constructor(protected readonly transport: Transport) {}

	/** Lists configured EPG sources. */
	listSources(options: RequestOptions = {}): Promise<EpgSource[]> {
		return this.transport.json(
			"GET",
			"/api/epg/sources",
			epgSourceListSchema,
			options,
		);
	}

	/** Creates an EPG source. */
	createSource(
		input: EpgSourceInput,
		options: RequestOptions = {},
	): Promise<EpgSource> {
		return this.transport.json(
			"POST",
			"/api/epg/sources",
			epgSourceSchema,
			jsonOptions(input, options),
		);
	}

	/** Replaces an EPG source. */
	updateSource(
		id: string,
		input: EpgSourceInput,
		options: RequestOptions = {},
	): Promise<EpgSource> {
		return this.transport.json(
			"PUT",
			`/api/epg/sources/${encodeURIComponent(id)}`,
			epgSourceSchema,
			jsonOptions(input, options),
		);
	}

	/** Deletes an EPG source and its associated data. */
	deleteSource(id: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"DELETE",
			`/api/epg/sources/${encodeURIComponent(id)}`,
			options,
		);
	}

	/** Queues an immediate refresh of an EPG source. */
	refreshSource(id: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"POST",
			`/api/epg/sources/${encodeURIComponent(id)}/refresh`,
			options,
		);
	}

	/** Lists stream-to-EPG-channel bindings. */
	listBindings(options: RequestOptions = {}): Promise<EpgBinding[]> {
		return this.transport.json(
			"GET",
			"/api/epg/bindings",
			epgBindingListSchema,
			options,
		);
	}

	/** Creates or replaces a stream-to-EPG-channel binding. */
	upsertBinding(
		input: EpgBindingInput,
		options: RequestOptions = {},
	): Promise<EpgBinding> {
		return this.transport.json(
			"PUT",
			"/api/epg/bindings",
			epgBindingSchema,
			jsonOptions(input, options),
		);
	}

	/** Deletes a stream binding for one EPG source. */
	deleteBinding(
		streamKey: string,
		sourceId: string,
		options: RequestOptions = {},
	): Promise<void> {
		return this.transport.void(
			"DELETE",
			`/api/epg/bindings/${encodeURIComponent(streamKey)}/${encodeURIComponent(sourceId)}`,
			options,
		);
	}

	/** Lists suggested EPG bindings for a stream. */
	listBindingCandidates(
		streamKey: string,
		options: RequestOptions = {},
	): Promise<EpgBindingCandidate[]> {
		return this.transport.json(
			"GET",
			`/api/epg/bindings/${encodeURIComponent(streamKey)}/candidates`,
			epgBindingCandidateListSchema,
			options,
		);
	}

	/** Lists channels imported from an EPG source. */
	listSourceChannels(
		sourceId: string,
		query: EpgSourceChannelQuery = {},
		options: RequestOptions = {},
	): Promise<EpgSourceChannel[]> {
		const path = withQuery(
			`/api/epg/sources/${encodeURIComponent(sourceId)}/channels`,
			{ q: query.search, limit: query.limit },
		);
		return this.transport.json(
			"GET",
			path,
			epgSourceChannelListSchema,
			options,
		);
	}

	/** Lists streams that can be shown in the EPG guide. */
	listDisplayableChannels(
		options: RequestOptions = {},
	): Promise<EpgDisplayableChannel[]> {
		return this.transport.json(
			"GET",
			"/api/epg/displayable-channels",
			epgDisplayableChannelListSchema,
			options,
		);
	}
}
