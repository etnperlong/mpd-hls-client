import { withQuery } from "../internal/query.js";
import {
	type CreateScheduleInput,
	type Schedule,
	type ScheduleKind,
	type ScheduleList,
	type ScheduleMeta,
	type SchedulePreview,
	type ScheduleRun,
	scheduleListSchema,
	scheduleMetaSchema,
	schedulePreviewSchema,
	scheduleRunSchema,
	scheduleSchema,
	type UpdateScheduleInput,
} from "../schemas/schedule.js";
import { jsonRequest, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

function jsonOptions(value: unknown, options: RequestOptions) {
	const request = jsonRequest(value);
	const headers = new Headers(options.headers);
	new Headers(request.headers).forEach((header, name) => {
		headers.set(name, header);
	});
	return { ...options, ...request, headers };
}

/** Client for schedule management operations. */
export class SchedulesResource {
	constructor(private readonly transport: Transport) {}

	/** Lists schedules, optionally filtered by stream key. */
	list(
		streamKey?: string,
		options: RequestOptions = {},
	): Promise<ScheduleList> {
		return this.transport.json(
			"GET",
			withQuery("/api/schedules", { stream_key: streamKey }),
			scheduleListSchema,
			options,
		);
	}

	/** Gets a schedule by identifier. */
	get(id: string, options: RequestOptions = {}): Promise<Schedule> {
		return this.transport.json(
			"GET",
			`/api/schedules/${encodeURIComponent(id)}`,
			scheduleSchema,
			options,
		);
	}

	/** Gets server timing and pending schedule metadata. */
	meta(options: RequestOptions = {}): Promise<ScheduleMeta> {
		return this.transport.json(
			"GET",
			"/api/schedules/meta",
			scheduleMetaSchema,
			options,
		);
	}

	/** Previews the next runs for a trigger and timezone. */
	preview(
		kind: ScheduleKind,
		timezone: string,
		options: RequestOptions = {},
	): Promise<SchedulePreview> {
		return this.transport.json(
			"POST",
			"/api/schedules/preview",
			schedulePreviewSchema,
			jsonOptions({ kind, timezone }, options),
		);
	}

	/** Creates a schedule. */
	create(
		input: CreateScheduleInput,
		options: RequestOptions = {},
	): Promise<Schedule> {
		return this.transport.json(
			"POST",
			"/api/schedules",
			scheduleSchema,
			jsonOptions(input, options),
		);
	}

	/** Updates mutable schedule fields. */
	update(
		id: string,
		input: UpdateScheduleInput,
		options: RequestOptions = {},
	): Promise<Schedule> {
		return this.transport.json(
			"PUT",
			`/api/schedules/${encodeURIComponent(id)}`,
			scheduleSchema,
			jsonOptions(input, options),
		);
	}

	/** Deletes a schedule. */
	delete(id: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"DELETE",
			`/api/schedules/${encodeURIComponent(id)}`,
			options,
		);
	}

	/** Enables a schedule. */
	enable(id: string, options: RequestOptions = {}): Promise<Schedule> {
		return this.transport.json(
			"POST",
			`/api/schedules/${encodeURIComponent(id)}/enable`,
			scheduleSchema,
			options,
		);
	}

	/** Disables a schedule. */
	disable(id: string, options: RequestOptions = {}): Promise<Schedule> {
		return this.transport.json(
			"POST",
			`/api/schedules/${encodeURIComponent(id)}/disable`,
			scheduleSchema,
			options,
		);
	}

	/** Runs a schedule immediately. */
	runNow(id: string, options: RequestOptions = {}): Promise<ScheduleRun> {
		return this.transport.json(
			"POST",
			`/api/schedules/${encodeURIComponent(id)}/run-now`,
			scheduleRunSchema,
			options,
		);
	}
}
