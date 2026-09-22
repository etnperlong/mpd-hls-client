import { withQuery } from "../internal/query.js";
import {
	type ChannelTraffic,
	channelTrafficSchema,
	type TrafficOverview,
	trafficOverviewSchema,
} from "../schemas/traffic.js";
import type { Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Client-only filters accepted by the traffic overview endpoint. */
export interface TrafficOverviewQuery {
	search?: string;
	activeOnly?: boolean;
	page?: number;
	perPage?: number;
}

/** Client for aggregate and per-channel traffic operations. */
export class TrafficResource {
	constructor(private readonly transport: Transport) {}

	/** Lists traffic totals with optional search and active filters. */
	overview(
		query: TrafficOverviewQuery = {},
		options: RequestOptions = {},
	): Promise<TrafficOverview> {
		return this.transport.json(
			"GET",
			withQuery("/api/traffic", {
				search: query.search,
				active_only: query.activeOnly,
				page: query.page,
				per_page: query.perPage,
			}),
			trafficOverviewSchema,
			options,
		);
	}

	/** Reads traffic totals for a channel identified by its stream key. */
	channel(
		streamKey: string,
		options: RequestOptions = {},
	): Promise<ChannelTraffic> {
		return this.transport.json(
			"GET",
			`/api/channels/${encodeURIComponent(streamKey)}/traffic`,
			channelTrafficSchema,
			options,
		);
	}
}
