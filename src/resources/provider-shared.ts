import type { z } from "zod";
import { withQuery } from "../internal/query.js";
import {
	type ProviderCategoryList,
	type ProviderImportResult,
	type ProviderLink,
	type ProviderSessionList,
	type ProviderTestEvent,
	providerCategoryListSchema,
	providerImportResultSchema,
	providerLinkSchema,
	providerSessionListSchema,
	providerTestEventSchema,
} from "../schemas/providers.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

type ProviderPath = "xtream" | "stalker";
/** Controls filtering and pagination for provider channels. */
export interface ProviderChannelQuery {
	search?: string;
	category?: string;
	page?: number;
	perPage?: number;
}

/** Fields accepted when creating or updating an Xtream account. */
export interface XtreamAccountInput {
	name: string;
	host: string;
	username: string;
	/** Send the literal "unchanged" on update to keep the stored password. */
	password: string;
	refresh_interval_secs: number;
	max_connections: number;
	upstream_headers: Record<string, string>;
	allowed_user_ids: string[];
	user_agent?: string;
	upstream_proxy_url?: string;
}

/** Fields accepted when creating or updating a Stalker account. */
export interface StalkerAccountInput {
	name: string;
	host: string;
	mac: string;
	refresh_interval_secs: number;
	max_connections: number;
	upstream_headers: Record<string, string>;
	allowed_user_ids: string[];
	user_agent?: string;
	upstream_proxy_url?: string;
}

/** Common fields accepted when importing provider channels. */
export interface ProviderImportInput {
	channel_ids: string[];
	group_id: string;
	delivery_mode: "package" | "hls_proxy" | "redirect";
	overwrite_category?: boolean;
	raw_passthrough?: boolean;
}

/** Fields accepted when importing Xtream channels. */
export interface XtreamImportInput extends ProviderImportInput {
	on_demand?: boolean;
}

/** Playback modes supported by provider channel links. */
export type ProviderLinkMode = "hls" | "raw";

/** Shared operations for Xtream and Stalker provider accounts. */
export class ProviderAccountsResource<
	P extends ProviderPath,
	I extends ProviderImportInput = ProviderImportInput,
> {
	constructor(
		protected readonly transport: Transport,
		private readonly provider: P,
	) {}

	/** Lists categories exposed by a provider account. */
	listCategories(
		accountId: string,
		options: RequestOptions = {},
	): Promise<ProviderCategoryList> {
		return this.transport.json(
			"GET",
			`${this.accountPath(accountId)}/categories`,
			providerCategoryListSchema,
			options,
		);
	}

	/** Deletes a provider account. */
	deleteAccount(
		accountId: string,
		options: RequestOptions = {},
	): Promise<void> {
		return this.transport.void("DELETE", this.accountPath(accountId), options);
	}

	/** Starts synchronization of a provider account. */
	syncAccount(accountId: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"POST",
			`${this.accountPath(accountId)}/sync`,
			options,
		);
	}

	/** Imports provider channels into a project group. */
	importChannels(
		accountId: string,
		input: I,
		options: RequestOptions = {},
	): Promise<ProviderImportResult> {
		return this.transport.json(
			"POST",
			`${this.accountPath(accountId)}/channels/import`,
			providerImportResultSchema,
			jsonOptions(input, options),
		);
	}

	/** Streams test results for selected provider channels. */
	testChannels(
		accountId: string,
		channelIds: string[],
		options: RequestOptions = {},
	): AsyncGenerator<ProviderTestEvent> {
		return this.transport.ndjson(
			"POST",
			`${this.accountPath(accountId)}/channels/test`,
			providerTestEventSchema,
			jsonOptions({ channel_ids: channelIds }, options),
		);
	}

	/** Obtains an HLS or raw playback link for a provider channel. */
	channelLink(
		accountId: string,
		channelId: string,
		mode: ProviderLinkMode = "hls",
		options: RequestOptions = {},
	): Promise<ProviderLink> {
		const path = withQuery(
			`${this.accountPath(accountId)}/channels/${encodeURIComponent(channelId)}/link`,
			{ mode },
		);
		return this.transport.json("GET", path, providerLinkSchema, options);
	}

	/** Lists active sessions for a provider account. */
	listSessions(
		accountId: string,
		options: RequestOptions = {},
	): Promise<ProviderSessionList> {
		return this.transport.json(
			"GET",
			`/api/providers/${this.provider}/accounts/${encodeURIComponent(accountId)}/sessions`,
			providerSessionListSchema,
			options,
		);
	}

	/** Stops a session identified by the ProviderSession.stream_key value. */
	stopSession(
		accountId: string,
		sessionId: string,
		options: RequestOptions = {},
	): Promise<void> {
		return this.transport.void(
			"DELETE",
			`/api/providers/${this.provider}/accounts/${encodeURIComponent(accountId)}/sessions/${encodeURIComponent(sessionId)}`,
			options,
		);
	}

	/** Lists provider channels using the provider-specific channel schema. */
	protected listProviderChannels<T>(
		accountId: string,
		query: ProviderChannelQuery,
		schema: z.ZodType<T>,
		options: RequestOptions = {},
	): Promise<T> {
		const path = withQuery(`${this.accountPath(accountId)}/channels`, {
			search: query.search,
			category: query.category,
			page: query.page,
			per_page: query.perPage,
		});
		return this.transport.json("GET", path, schema, options);
	}

	protected accountPath(accountId: string): string {
		return `/api/${this.provider}/accounts/${encodeURIComponent(accountId)}`;
	}
}
