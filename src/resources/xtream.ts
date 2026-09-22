import {
	type XtreamAccount,
	type XtreamChannelList,
	xtreamAccountListSchema,
	xtreamAccountSchema,
	xtreamChannelListSchema,
} from "../schemas/providers.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";
import {
	ProviderAccountsResource,
	type ProviderChannelQuery,
	type XtreamAccountInput,
	type XtreamImportInput,
} from "./provider-shared.js";

/** Client for Xtream Codes provider account operations. */
export class XtreamResource extends ProviderAccountsResource<
	"xtream",
	XtreamImportInput
> {
	constructor(transport: Transport) {
		super(transport, "xtream");
	}

	/** Lists configured Xtream Codes accounts. */
	listAccounts(options: RequestOptions = {}): Promise<XtreamAccount[]> {
		return this.transport.json(
			"GET",
			"/api/xtream/accounts",
			xtreamAccountListSchema,
			options,
		);
	}

	/** Creates an Xtream Codes account. */
	createAccount(
		input: XtreamAccountInput,
		options: RequestOptions = {},
	): Promise<XtreamAccount> {
		return this.transport.json(
			"POST",
			"/api/xtream/accounts",
			xtreamAccountSchema,
			jsonOptions(input, options),
		);
	}

	/** Replaces an Xtream Codes account. */
	updateAccount(
		accountId: string,
		input: XtreamAccountInput,
		options: RequestOptions = {},
	): Promise<XtreamAccount> {
		return this.transport.json(
			"PUT",
			this.accountPath(accountId),
			xtreamAccountSchema,
			jsonOptions(input, options),
		);
	}

	/** Lists channels exposed by an Xtream Codes account. */
	listChannels(
		accountId: string,
		query: ProviderChannelQuery = {},
		options: RequestOptions = {},
	): Promise<XtreamChannelList> {
		return super.listProviderChannels(
			accountId,
			query,
			xtreamChannelListSchema,
			options,
		);
	}
}
