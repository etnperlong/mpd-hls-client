import {
	type StalkerAccount,
	type StalkerChannelList,
	stalkerAccountListSchema,
	stalkerAccountSchema,
	stalkerChannelListSchema,
} from "../schemas/providers.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";
import {
	ProviderAccountsResource,
	type ProviderChannelQuery,
	type StalkerAccountInput,
} from "./provider-shared.js";

/** Client for Stalker portal provider account operations. */
export class StalkerResource extends ProviderAccountsResource<"stalker"> {
	constructor(transport: Transport) {
		super(transport, "stalker");
	}

	/** Lists configured Stalker portal accounts. */
	listAccounts(options: RequestOptions = {}): Promise<StalkerAccount[]> {
		return this.transport.json(
			"GET",
			"/api/stalker/accounts",
			stalkerAccountListSchema,
			options,
		);
	}

	/** Creates a Stalker portal account. */
	createAccount(
		input: StalkerAccountInput,
		options: RequestOptions = {},
	): Promise<StalkerAccount> {
		return this.transport.json(
			"POST",
			"/api/stalker/accounts",
			stalkerAccountSchema,
			jsonOptions(input, options),
		);
	}

	/** Replaces a Stalker portal account. */
	updateAccount(
		accountId: string,
		input: StalkerAccountInput,
		options: RequestOptions = {},
	): Promise<StalkerAccount> {
		return this.transport.json(
			"PUT",
			this.accountPath(accountId),
			stalkerAccountSchema,
			jsonOptions(input, options),
		);
	}

	/** Lists channels exposed by a Stalker portal account. */
	listChannels(
		accountId: string,
		query: ProviderChannelQuery = {},
		options: RequestOptions = {},
	): Promise<StalkerChannelList> {
		return super.listProviderChannels(
			accountId,
			query,
			stalkerChannelListSchema,
			options,
		);
	}
}
