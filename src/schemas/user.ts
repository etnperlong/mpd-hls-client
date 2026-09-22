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
	label: z.string().nullable().optional(),
	created_at_ms: z.number().int(),
	last_seen_at_ms: z.number().int().nullable().optional(),
	expires_at_ms: z.number().int().nullable().optional(),
});

/** Schema for a response containing user access tokens. */
export const UserTokenListSchema = itemListSchema(UserTokenSchema);

export type User = z.infer<typeof UserSchema>;
export type UserList = z.infer<typeof UserListSchema>;
export type UserToken = z.infer<typeof UserTokenSchema>;
export type UserTokenList = z.infer<typeof UserTokenListSchema>;
