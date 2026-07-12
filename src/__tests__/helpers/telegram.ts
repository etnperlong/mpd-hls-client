import type { TelegramConfigUpdate } from "../../schemas/telegram";
import { Transport } from "../../transport";

export function createTelegramTransport(
	fetch: typeof globalThis.fetch,
): Transport {
	return new Transport({
		baseUrl: "https://example.test/root",
		auth: { username: "admin", password: "secret" },
		fetch,
	});
}

export function telegramConfig() {
	return {
		enabled: true,
		chat_id: 123,
		admin_tg_ids: [123],
		alerts: {
			session_failed: true,
			cdm_error: true,
			script_error: true,
			disk_low: true,
			schedule_failed: true,
			recording_failed: true,
			stream_slow: true,
			nested_extension: "kept",
		},
		events: {
			schedule_success: true,
			session_phase: false,
			on_demand: false,
			batch_progress: false,
			recording_finished: false,
			stream_recovered: false,
		},
		commands: {
			query: true,
			channel_control: true,
			batch_ops: false,
			recording_control: false,
			schedule_control: false,
		},
		disk_low: { kind: "percent", value: 10, min_interval_secs: 300 },
		dedup_window_secs: 60,
		rate_limit_per_minute: 20,
		poll_timeout_secs: 25,
		bot_language: "en",
		bot_token_last4: "last",
		updated_at_ms: 1_700_000_000_000,
		server_extension: { enabled: true },
	};
}

export function updateInput(): TelegramConfigUpdate {
	const {
		bot_token_last4: _tokenHint,
		updated_at_ms: _updatedAt,
		...input
	} = telegramConfig();
	return { ...input, bot_token: "replacement-token" };
}

export function createTelegramFetch(
	handler: (
		url: string | URL | Request,
		init?: RequestInit,
	) => Promise<Response>,
) {
	return Object.assign(handler, {
		preconnect: globalThis.fetch.preconnect,
	}) as typeof globalThis.fetch;
}
