import { z } from "zod";
import { itemListSchema } from "./common.js";

/** Schema for a user returned by the management API. */
export const UserSchema = z.looseObject({
	id: z.string(),
	username: z.string(),
	role: z.string(),
	web_ui_access: z.boolean(),
	channel_filter_enabled: z.boolean(),
	allowed_group_ids: z.array(z.string()),
	allowed_channel_ids: z.array(z.string()),
	playlist_url: z.string(),
	created_at_ms: z.number().int(),
	updated_at_ms: z.number().int(),
});

/** Schema for a response containing users. */
export const UserListSchema = itemListSchema(UserSchema);

/** Schema for an access token returned by the management API. */
export const UserTokenSchema = z.looseObject({
	token: z.string(),
	user_id: z.string(),
	purpose: z.string(),
	label: z.string().nullable().optional(),
	created_at_ms: z.number().int(),
	last_seen_at_ms: z.number().int().nullable().optional(),
	expires_at_ms: z.number().int().nullable().optional(),
	subscription_url: z.string(),
});

/** Schema for a response containing user access tokens. */
export const UserTokenListSchema = itemListSchema(UserTokenSchema);

/** Schema for a channel option used in user access forms. */
export const UserChannelOptionSchema = z.looseObject({
	channel_id: z.string(),
	group_id: z.string(),
	group_name: z.string(),
	name: z.string(),
});

/** Schema for a response containing user channel options. */
export const UserChannelOptionListSchema = itemListSchema(
	UserChannelOptionSchema,
);

export type User = z.infer<typeof UserSchema>;
export type UserList = z.infer<typeof UserListSchema>;
export type UserToken = z.infer<typeof UserTokenSchema>;
export type UserTokenList = z.infer<typeof UserTokenListSchema>;
/** User channel option returned by the management API. */
export type UserChannelOption = z.infer<typeof UserChannelOptionSchema>;

/** User channel option list returned by the management API. */
export type UserChannelOptionList = z.infer<typeof UserChannelOptionListSchema>;
