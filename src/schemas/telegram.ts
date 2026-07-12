import { z } from "zod";

/** Schema for Telegram alert notification toggles. */
export const telegramAlertsSchema = z.looseObject({
	session_failed: z.boolean(),
	cdm_error: z.boolean(),
	script_error: z.boolean(),
	disk_low: z.boolean(),
	schedule_failed: z.boolean(),
	recording_failed: z.boolean(),
	stream_slow: z.boolean(),
});

/** Schema for Telegram event notification toggles. */
export const telegramEventsSchema = z.looseObject({
	schedule_success: z.boolean(),
	session_phase: z.boolean(),
	on_demand: z.boolean(),
	batch_progress: z.boolean(),
	recording_finished: z.boolean(),
	stream_recovered: z.boolean(),
});

/** Schema for Telegram command permission toggles. */
export const telegramCommandsSchema = z.looseObject({
	query: z.boolean(),
	channel_control: z.boolean(),
	batch_ops: z.boolean(),
	recording_control: z.boolean(),
	schedule_control: z.boolean(),
});

/** Schema for the Telegram low-disk notification threshold. */
export const telegramDiskLowSchema = z.looseObject({
	kind: z.string(),
	value: z.number(),
	min_interval_secs: z.number().int().nonnegative(),
});

const telegramConfigFields = {
	enabled: z.boolean(),
	chat_id: z.number().int().nullable(),
	admin_tg_ids: z.array(z.number().int()),
	alerts: telegramAlertsSchema,
	events: telegramEventsSchema,
	commands: telegramCommandsSchema,
	disk_low: telegramDiskLowSchema,
	dedup_window_secs: z.number().int().positive(),
	rate_limit_per_minute: z.number().int().positive(),
	poll_timeout_secs: z.number().int().min(1).max(50),
	bot_language: z.string(),
};

/** Schema for the persisted Telegram integration configuration. */
export const telegramConfigSchema = z.looseObject({
	...telegramConfigFields,
	bot_token_last4: z.string().optional(),
	updated_at_ms: z.number().int().nonnegative(),
});

/** Schema for replacing the Telegram integration configuration. */
export const telegramConfigUpdateSchema = z.looseObject({
	...telegramConfigFields,
	bot_token: z.string().optional(),
});

/** Schema for a Telegram connectivity test request. */
export const telegramTestInputSchema = z.looseObject({
	bot_token: z.string().optional(),
	chat_id: z.number().int().optional(),
});

/** Schema for a Telegram connectivity test response. */
export const telegramTestResultSchema = z.looseObject({
	ok: z.boolean(),
	error: z.string().optional(),
});

/** Schema for a Telegram message log entry. */
export const telegramLogEntrySchema = z.looseObject({
	ts_ms: z.number().int().nonnegative(),
	direction: z.enum(["in", "out"]),
	status: z.enum(["sent", "error", "dropped"]),
	kind: z.string(),
	chat_id: z.number().int().optional(),
	from: z.string().optional(),
	text: z.string(),
	note: z.string().optional(),
});

/** Schema for a Telegram message log list. */
export const telegramLogListSchema = z.looseObject({
	items: z.array(telegramLogEntrySchema),
});

export type TelegramConfig = z.infer<typeof telegramConfigSchema>;
export type TelegramConfigUpdate = z.infer<typeof telegramConfigUpdateSchema>;
export type TelegramTestInput = z.infer<typeof telegramTestInputSchema>;
export type TelegramTestResult = z.infer<typeof telegramTestResultSchema>;
export type TelegramLogEntry = z.infer<typeof telegramLogEntrySchema>;
export type TelegramLogList = z.infer<typeof telegramLogListSchema>;
