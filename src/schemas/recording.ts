import { z } from "zod";
import { itemListSchema } from "./common.js";

/** Schema for a downloadable recording output. */
export const recordingFileSchema = z.looseObject({
	name: z.string(),
	kind: z.string(),
	size_bytes: z.number().int().nonnegative().nullable().optional(),
});

/** Schema for a recording task entity. */
export const recordingSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	stream_key: z.string(),
	status: z.string(),
	channel_name: z.string().nullable().optional(),
	schedule_id: z.string().nullable().optional(),
	planned_start_ms: z.number().int().nullable().optional(),
	planned_stop_ms: z.number().int().nullable().optional(),
	actual_start_wallclock_ms: z.number().int().nullable().optional(),
	actual_stop_wallclock_ms: z.number().int().nullable().optional(),
	captured_segments: z.number().int().nonnegative().optional(),
	bytes_staged: z.number().int().nonnegative().optional(),
	output_bytes: z.number().int().nonnegative().nullable().optional(),
	output_file: z.string().nullable().optional(),
	files: z.array(recordingFileSchema).nullable().optional(),
	interrupted_reason: z.string().nullable().optional(),
	error: z.string().nullable().optional(),
});

/** Schema for a recording task list response. */
export const recordingListSchema = itemListSchema(recordingSchema);

/** Schema for server-side recording directory configuration. */
export const recordingConfigSchema = z.looseObject({
	default_output_dir: z.string(),
	staging_dir: z.string(),
});

/** Wire payload used to start a recording task. */
export interface CreateRecordingInput {
	stream_key: string;
	name: string;
	duration_secs: number | null;
	output_dir: string | null;
}

export type RecordingFile = z.infer<typeof recordingFileSchema>;
export type Recording = z.infer<typeof recordingSchema>;
export type RecordingList = z.infer<typeof recordingListSchema>;
export type RecordingConfig = z.infer<typeof recordingConfigSchema>;
