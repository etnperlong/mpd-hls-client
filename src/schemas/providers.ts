import { z } from "zod";
import { itemListSchema } from "./common.js";

const accountBase = {
	id: z.string(),
	name: z.string(),
	host: z.string(),
	refresh_interval_secs: z.number(),
	max_connections: z.number(),
	allowed_user_ids: z.array(z.string()),
	active_streams: z.number(),
	channel_count: z.number(),
	category_count: z.number(),
	user_agent: z.string().nullish(),
	upstream_headers: z.record(z.string(), z.string()).nullish(),
	upstream_proxy_url: z.string().nullish(),
	last_sync_ms: z.number().nullish(),
	expires_at_ms: z.number().nullish(),
};

/** Schema for an Xtream Codes account. */
export const xtreamAccountSchema = z.looseObject({
	...accountBase,
	username: z.string(),
});

/** Schema for a Stalker portal account. */
export const stalkerAccountSchema = z.looseObject({
	...accountBase,
	mac: z.string(),
});

/** Schema for a channel offered by an Xtream account. */
export const xtreamChannelSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	icon: z.string().nullish(),
	category: z.string().nullish(),
	stream_type: z.string().nullish(),
});

/** Schema for a channel offered by a Stalker portal account. */
export const stalkerChannelSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	logo: z.string().nullish(),
	category: z.string().nullish(),
});

/** Schema for a page of upstream provider channels. */
export function providerChannelListSchema<T extends z.ZodType>(channel: T) {
	return z.looseObject({
		items: z.array(channel),
		total: z.number(),
	});
}

/** Schema for the category names published by a provider account. */
export const providerCategoryListSchema = itemListSchema(z.string());

/** Schema for one upstream connection currently held by an account. */
export const providerSessionSchema = z.looseObject({
	name: z.string(),
	playback_mode: z.string(),
	stream_key: z.string(),
});

/** Schema for the active sessions of a provider account. */
export const providerSessionListSchema = itemListSchema(providerSessionSchema);

/** Schema for one streamed result of a provider channel test. */
export const providerTestEventSchema = z.looseObject({
	id: z.string(),
	ok: z.boolean(),
	status: z.number().nullish(),
	latency_ms: z.number(),
	first_bytes: z.number().nullish(),
	error: z.string().nullish(),
});

/** Schema for the result of importing provider channels. */
export const providerImportResultSchema = z.looseObject({
	count: z.number(),
});

/** Schema for a playback link issued for a provider channel. */
export const providerLinkSchema = z.looseObject({
	url: z.string(),
	active_streams: z.number(),
	max_connections: z.number(),
});

/** A list of Xtream Codes accounts. */
export const xtreamAccountListSchema = z.array(xtreamAccountSchema);

/** A list of Stalker portal accounts. */
export const stalkerAccountListSchema = z.array(stalkerAccountSchema);

/** A page of channels offered by an Xtream account. */
export const xtreamChannelListSchema =
	providerChannelListSchema(xtreamChannelSchema);

/** A page of channels offered by a Stalker account. */
export const stalkerChannelListSchema =
	providerChannelListSchema(stalkerChannelSchema);

/** An Xtream Codes account returned by the API. */
export type XtreamAccount = z.infer<typeof xtreamAccountSchema>;

/** A Stalker portal account returned by the API. */
export type StalkerAccount = z.infer<typeof stalkerAccountSchema>;

/** An Xtream channel returned by the API. */
export type XtreamChannel = z.infer<typeof xtreamChannelSchema>;

/** A Stalker channel returned by the API. */
export type StalkerChannel = z.infer<typeof stalkerChannelSchema>;

/** A page of Xtream channels returned by the API. */
export type XtreamChannelList = z.infer<typeof xtreamChannelListSchema>;

/** A page of Stalker channels returned by the API. */
export type StalkerChannelList = z.infer<typeof stalkerChannelListSchema>;

/** Categories returned by a provider account. */
export type ProviderCategoryList = z.infer<typeof providerCategoryListSchema>;

/** An active provider session. */
export type ProviderSession = z.infer<typeof providerSessionSchema>;

/** Active sessions returned by a provider account. */
export type ProviderSessionList = z.infer<typeof providerSessionListSchema>;

/** One streamed provider channel test result. */
export type ProviderTestEvent = z.infer<typeof providerTestEventSchema>;

/** The result of importing provider channels. */
export type ProviderImportResult = z.infer<typeof providerImportResultSchema>;

/** A playback link issued for a provider channel. */
export type ProviderLink = z.infer<typeof providerLinkSchema>;
