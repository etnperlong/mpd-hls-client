import { withQuery } from "../internal/query.js";
import {
	type CreateRecordingInput,
	type Recording,
	type RecordingConfig,
	type RecordingList,
	recordingConfigSchema,
	recordingListSchema,
	recordingSchema,
} from "../schemas/recording.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Client for recording task management operations. */
export class RecordingsResource {
	constructor(private readonly transport: Transport) {}

	/** Lists all recording tasks. */
	list(options: RequestOptions = {}): Promise<RecordingList> {
		return this.transport.json(
			"GET",
			"/api/recording/tasks",
			recordingListSchema,
			options,
		);
	}

	/** Gets a recording task by identifier. */
	get(id: string, options: RequestOptions = {}): Promise<Recording> {
		return this.transport.json(
			"GET",
			`/api/recording/tasks/${encodeURIComponent(id)}`,
			recordingSchema,
			options,
		);
	}

	/** Creates and starts a recording task. */
	create(
		input: CreateRecordingInput,
		options: RequestOptions = {},
	): Promise<Recording> {
		return this.transport.json(
			"POST",
			"/api/recording/tasks",
			recordingSchema,
			jsonOptions(input, options),
		);
	}

	/** Cancels an active or scheduled recording task. */
	cancel(
		id: string,
		reason: string | null = null,
		options: RequestOptions = {},
	): Promise<void> {
		return this.transport.void(
			"POST",
			`/api/recording/tasks/${encodeURIComponent(id)}/cancel`,
			jsonOptions({ reason }, options),
		);
	}

	/** Retries finalization for a failed recording task. */
	retryFinalize(id: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"POST",
			`/api/recording/tasks/${encodeURIComponent(id)}/retry-finalize`,
			options,
		);
	}

	/** Deletes a recording task and optionally its output files. */
	delete(
		id: string,
		deleteFile = false,
		options: RequestOptions = {},
	): Promise<void> {
		return this.transport.void(
			"DELETE",
			withQuery(`/api/recording/tasks/${encodeURIComponent(id)}`, {
				delete_file: deleteFile ? true : undefined,
			}),
			options,
		);
	}

	/** Gets recording storage configuration. */
	config(options: RequestOptions = {}): Promise<RecordingConfig> {
		return this.transport.json(
			"GET",
			"/api/recording/config",
			recordingConfigSchema,
			options,
		);
	}

	/** Downloads a recording output as a raw response. */
	download(
		id: string,
		file?: string,
		options: RequestOptions = {},
	): Promise<Response> {
		return this.transport.response(
			"GET",
			withQuery(`/api/recording/tasks/${encodeURIComponent(id)}/download`, {
				file,
			}),
			options,
		);
	}
}
