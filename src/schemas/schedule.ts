import { z } from "zod";
import { itemListSchema } from "./common.js";

/** Schema for a one-time schedule trigger. */
export const onceScheduleKindSchema = z.looseObject({
	type: z.literal("once"),
	run_at_ms: z.number().int(),
});

/** Schema for a daily schedule trigger. */
export const dailyScheduleKindSchema = z.looseObject({
	type: z.literal("daily"),
	hour: z.number().int().min(0).max(23),
	minute: z.number().int().min(0).max(59),
});

/** Schema for a weekly schedule trigger. */
export const weeklyScheduleKindSchema = z.looseObject({
	type: z.literal("weekly"),
	weekdays: z.array(z.number().int().min(0).max(6)),
	hour: z.number().int().min(0).max(23),
	minute: z.number().int().min(0).max(59),
});

/** Schema for a cron schedule trigger. */
export const cronScheduleKindSchema = z.looseObject({
	type: z.literal("cron"),
	expr: z.string(),
});

/** Schema for a schedule trigger definition. */
export const scheduleKindSchema = z.discriminatedUnion("type", [
	onceScheduleKindSchema,
	dailyScheduleKindSchema,
	weeklyScheduleKindSchema,
	cronScheduleKindSchema,
]);

/** Schema for schedule recording settings. */
export const scheduleRecordSpecSchema = z.looseObject({
	duration_secs: z.number().int().positive(),
	pre_buffer_secs: z.number().int().nonnegative(),
	post_buffer_secs: z.number().int().nonnegative(),
	output_dir: z.string().nullable(),
	task_name_template: z.string().nullable(),
});

/** Schema for an action performed by a schedule. */
export const scheduleActionSchema = z.discriminatedUnion("type", [
	z.looseObject({ type: z.literal("start") }),
	z.looseObject({ type: z.literal("stop") }),
	z.looseObject({
		type: z.literal("record"),
		spec: scheduleRecordSpecSchema,
	}),
]);

/** Schema for a schedule entity. */
export const scheduleSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	stream_key: z.string(),
	action: scheduleActionSchema,
	kind: scheduleKindSchema,
	enabled: z.boolean(),
	created_at_ms: z.number().int(),
	updated_at_ms: z.number().int(),
	last_run_ms: z.number().int().nullable(),
	last_error: z.string().nullable(),
	source: z.looseObject({ type: z.string() }),
	timezone: z.string(),
	stream_name: z.string().nullable().optional(),
	next_run_ms: z.number().int().nullable(),
});

/** Schema for a schedule list response. */
export const scheduleListSchema = itemListSchema(scheduleSchema);

/** Schema for schedule timing metadata. */
export const scheduleMetaSchema = z.looseObject({
	server_time_ms: z.number().int(),
	next_run_ms: z.number().int().nullable(),
	next_run_schedule_id: z.string().nullable(),
	missed_once_count: z.number().int().nonnegative(),
});

/** Schema for a schedule preview response. */
export const schedulePreviewSchema = z.looseObject({
	next_runs: z.array(z.number().int()),
});

/** Schema for an accepted run-now request. */
export const scheduleRunSchema = z.looseObject({
	id: z.string(),
});

/** Wire payload used to create a schedule. */
export interface CreateScheduleInput {
	name: string;
	stream_key: string;
	action: ScheduleAction;
	kind: ScheduleKind;
	timezone: string;
}

/** Wire payload used to update a schedule. */
export interface UpdateScheduleInput {
	name?: string;
	action?: ScheduleAction;
	kind?: ScheduleKind;
	timezone?: string;
	clear_error?: boolean;
}

export type ScheduleKind = z.infer<typeof scheduleKindSchema>;
export type ScheduleRecordSpec = z.infer<typeof scheduleRecordSpecSchema>;
export type ScheduleAction = z.infer<typeof scheduleActionSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
export type ScheduleList = z.infer<typeof scheduleListSchema>;
export type ScheduleMeta = z.infer<typeof scheduleMetaSchema>;
export type SchedulePreview = z.infer<typeof schedulePreviewSchema>;
export type ScheduleRun = z.infer<typeof scheduleRunSchema>;
