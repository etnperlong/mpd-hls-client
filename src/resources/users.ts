import type {
	User,
	UserChannelOptionList,
	UserList,
	UserToken,
	UserTokenList,
} from "../schemas/user.js";
import {
	UserChannelOptionListSchema,
	UserListSchema,
	UserSchema,
	UserTokenListSchema,
	UserTokenSchema,
} from "../schemas/user.js";
import type { Transport } from "../transport.js";
import { jsonOptions } from "../transport.js";
import type { RequestOptions } from "../types.js";
/** Wire payload accepted by the user creation endpoint. */
export interface CreateUserInput {
	username: string;
	password: string;
	role: string;
	allowed_group_ids: readonly string[];
	channel_filter_enabled: boolean;
	allowed_channel_ids: readonly string[];
	web_ui_access: boolean;
}

/** Wire payload accepted by the user update endpoint. */
export interface UpdateUserInput {
	username?: string;
	role?: string;
	allowed_group_ids?: readonly string[];
	channel_filter_enabled?: boolean;
	allowed_channel_ids?: readonly string[];
	web_ui_access?: boolean;
}

/** Client options accepted by the user token creation endpoint. */
export interface CreateUserTokenInput {
	label?: string;
	ttl_secs?: number;
	ttlSecs?: number;
}

/** Client for user and user-token management operations. */
export class UsersResource {
	constructor(private readonly transport: Transport) {}

	/** Lists all users. */
	list(options: RequestOptions = {}): Promise<UserList> {
		return this.transport.json("GET", "/api/users", UserListSchema, options);
	}

	/** Creates a user. */
	create(
		payload: CreateUserInput,
		options: RequestOptions = {},
	): Promise<User> {
		return this.transport.json(
			"POST",
			"/api/users",
			UserSchema,
			jsonOptions(payload, options),
		);
	}

	/** Lists channel choices used when configuring user access. */
	listChannelOptions(
		options: RequestOptions = {},
	): Promise<UserChannelOptionList> {
		return this.transport.json(
			"GET",
			"/api/users/channel-options",
			UserChannelOptionListSchema,
			options,
		);
	}

	/** Updates a user's profile and group access. */
	update(
		userId: string,
		payload: UpdateUserInput,
		options: RequestOptions = {},
	): Promise<User> {
		return this.transport.json(
			"PUT",
			this.userPath(userId),
			UserSchema,
			jsonOptions(payload, options),
		);
	}

	/** Replaces a user's password. */
	updatePassword(
		userId: string,
		password: string,
		options: RequestOptions = {},
	): Promise<User> {
		return this.transport.json(
			"POST",
			`${this.userPath(userId)}/password`,
			UserSchema,
			jsonOptions({ password }, options),
		);
	}

	/** Deletes a user. */
	delete(userId: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void("DELETE", this.userPath(userId), options);
	}

	/** Lists a user's access tokens. */
	listTokens(
		userId: string,
		options: RequestOptions = {},
	): Promise<UserTokenList> {
		return this.transport.json(
			"GET",
			`${this.userPath(userId)}/tokens`,
			UserTokenListSchema,
			options,
		);
	}

	/** Creates an access token for a user. */
	createToken(
		userId: string,
		payload: CreateUserTokenInput,
		options: RequestOptions = {},
	): Promise<UserToken> {
		const ttlSecs = payload.ttlSecs ?? payload.ttl_secs;
		const body = {
			...(payload.label ? { label: payload.label } : {}),
			...(ttlSecs === undefined ? {} : { ttl_secs: ttlSecs }),
		};
		return this.transport.json(
			"POST",
			`${this.userPath(userId)}/tokens`,
			UserTokenSchema,
			jsonOptions(body, options),
		);
	}

	/** Revokes a user's access token. */
	revokeToken(
		userId: string,
		token: string,
		options: RequestOptions = {},
	): Promise<void> {
		return this.transport.void(
			"DELETE",
			`${this.userPath(userId)}/tokens/${encodeURIComponent(token)}`,
			options,
		);
	}

	/** Renews a user's access token lifetime. */
	renewToken(
		userId: string,
		token: string,
		ttlSecs: number | undefined,
		options: RequestOptions = {},
	): Promise<UserToken> {
		return this.transport.json(
			"PATCH",
			`${this.userPath(userId)}/tokens/${encodeURIComponent(token)}`,
			UserTokenSchema,
			jsonOptions({ ttl_secs: ttlSecs }, options),
		);
	}

	private userPath(userId: string): string {
		return `/api/users/${encodeURIComponent(userId)}`;
	}
}
