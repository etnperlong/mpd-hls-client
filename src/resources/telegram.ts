import { withQuery } from "../internal/query.js";
import {
	type TelegramConfig,
	type TelegramConfigUpdate,
	type TelegramLogList,
	type TelegramTestInput,
	type TelegramTestResult,
	telegramConfigSchema,
	telegramLogListSchema,
	telegramTestResultSchema,
} from "../schemas/telegram.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Query controls for listing Telegram message logs. */
export interface TelegramLogOptions {
	limit?: number;
	beforeMs?: number;
}

/** Client for Telegram integration configuration, testing, and logs. */
export class TelegramResource {
	constructor(private readonly transport: Transport) {}

	/** Returns the persisted Telegram integration configuration. */
	getConfig(options: RequestOptions = {}): Promise<TelegramConfig> {
		return this.transport.json(
			"GET",
			"/api/telegram/config",
			telegramConfigSchema,
			options,
		);
	}

	/** Replaces the Telegram integration configuration. */
	updateConfig(
		input: TelegramConfigUpdate,
		options: RequestOptions = {},
	): Promise<TelegramConfig> {
		return this.transport.json(
			"PUT",
			"/api/telegram/config",
			telegramConfigSchema,
			jsonOptions(input, options),
		);
	}

	/** Tests Telegram connectivity with persisted or supplied credentials. */
	test(
		input: TelegramTestInput = {},
		options: RequestOptions = {},
	): Promise<TelegramTestResult> {
		return this.transport.json(
			"POST",
			"/api/telegram/test",
			telegramTestResultSchema,
			jsonOptions(input, options),
		);
	}

	/** Lists Telegram message logs, optionally before a millisecond timestamp. */
	listLogs(
		query: TelegramLogOptions = {},
		options: RequestOptions = {},
	): Promise<TelegramLogList> {
		return this.transport.json(
			"GET",
			withQuery("/api/telegram/logs", {
				limit: query.limit,
				before_ms: query.beforeMs,
			}),
			telegramLogListSchema,
			options,
		);
	}
}
