import { z } from "zod";

const nullableNumber = z.number().nullable().optional();
const nullableString = z.string().nullable().optional();

/** Schema for one configured URL within an EPG source. */
export const epgSourceUrlSchema = z.looseObject({
	url: z.string(),
	priority: z.number().int(),
});

/** Schema for the fetch status of one EPG source URL. */
export const epgSourceUrlStatusSchema = z.looseObject({
	url: z.string(),
	priority: z.number().int(),
	last_fetch_started_at_ms: nullableNumber,
	last_fetch_finished_at_ms: nullableNumber,
	last_fetch_ok: z.boolean().nullable().optional(),
	channels: nullableNumber,
	programmes: nullableNumber,
	etag: nullableString,
	last_modified: nullableString,
	last_error: nullableString,
});

/** Schema for a configured XMLTV EPG source and its latest fetch state. */
export const epgSourceSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	urls: z.array(epgSourceUrlSchema),
	refresh_secs: z.number().int(),
	priority: z.number().int(),
	enabled: z.boolean(),
	created_at_ms: z.number(),
	updated_at_ms: z.number(),
	last_fetch_started_at_ms: nullableNumber,
	last_fetch_finished_at_ms: nullableNumber,
	last_fetch_ok: z.boolean().nullable().optional(),
	last_error: nullableString,
	channels: nullableNumber,
	programmes: nullableNumber,
	dropped_programmes: nullableNumber,
	dropped_due_to_dedup: nullableNumber,
	coverage_start_ms: nullableNumber,
	coverage_end_ms: nullableNumber,
	generator: nullableString,
	url_statuses: z.array(epgSourceUrlStatusSchema).optional(),
});

/** Schema for an upstream XMLTV channel display name. */
export const epgDisplayNameSchema = z.looseObject({
	lang: z.string().nullable().optional(),
	text: z.string(),
});

/** Schema for a channel available from one EPG source. */
export const epgSourceChannelSchema = z.looseObject({
	id: z.string(),
	display_names: z.array(epgDisplayNameSchema),
	icon: z.string().nullable().optional(),
});

/** Schema for a stream-to-EPG-channel binding. */
export const epgBindingSchema = z.looseObject({
	stream_key: z.string(),
	source_id: z.string(),
	raw_channel_id: z.string(),
	origin: z.string(),
	created_at_ms: z.number(),
	updated_at_ms: z.number(),
	upstream_display_name: nullableString,
	stream_name: nullableString,
	source_name: nullableString,
});

/** Schema for a suggested upstream EPG binding. */
export const epgBindingCandidateSchema = z.looseObject({
	source_id: z.string(),
	source_name: z.string(),
	raw_channel_id: z.string(),
	upstream_display_names: z.array(epgDisplayNameSchema),
	kind: z.string(),
	matched_alias: nullableString,
});

/** Schema for a stream that can be displayed in the EPG guide. */
export const epgDisplayableChannelSchema = z.looseObject({
	channel_id: z.string(),
	stream_key: z.string(),
	name: z.string(),
	logo: z.string().nullable(),
	delivery_mode: z.string(),
	group_id: z.string().nullable(),
	group_name: z.string().nullable(),
});

/** Schema for a programme returned by the EPG guide query. */
export const epgProgrammeSchema = z.looseObject({
	stream_key: z.string(),
	title: z.string(),
	start_ms: z.number(),
	stop_ms: z.number(),
	desc: nullableString,
});

/** Schema for a scheduled programme entry with backend-defined details. */
export const epgScheduledProgrammeSchema = z.looseObject({});

/** Recursive title-matching condition used by EPG keyword rules. */
export type EpgRuleCondition = (
	| { type: "contains"; text: string }
	| { type: "all" | "any"; conditions: EpgRuleCondition[] }
	| { type: "not"; condition: EpgRuleCondition }
) &
	Readonly<Record<string, unknown>>;

export const epgRuleConditionSchema: z.ZodType<EpgRuleCondition> = z.lazy(() =>
	z.discriminatedUnion("type", [
		z.looseObject({ type: z.literal("contains"), text: z.string() }),
		z.looseObject({
			type: z.enum(["all", "any"]),
			conditions: z.array(epgRuleConditionSchema),
		}),
		z.looseObject({
			type: z.literal("not"),
			condition: epgRuleConditionSchema,
		}),
	]),
);

/** Schema for the action performed by an EPG keyword rule. */
export const epgRuleActionSchema = z.discriminatedUnion("type", [
	z.looseObject({ type: z.enum(["start", "stop"]) }),
	z.looseObject({
		type: z.literal("record"),
		output_dir: z.string().nullable(),
		task_name_template: z.string().nullable(),
	}),
]);

/** Schema for a persisted EPG keyword rule. */
export const epgRuleSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	stream_key: z.string(),
	condition: epgRuleConditionSchema,
	action: epgRuleActionSchema,
	lead_secs: z.number().int(),
	tail_secs: z.number().int(),
	enabled: z.boolean(),
	created_at_ms: z.number().optional(),
	updated_at_ms: z.number(),
});

/** Schema for one programme matched by an EPG rule preview. */
export const epgRulePreviewMatchSchema = z.looseObject({
	title: z.string(),
	start_ms: z.number(),
	stop_ms: z.number(),
});

/** Schema for the result of previewing an EPG keyword rule. */
export const epgRulePreviewSchema = z.looseObject({
	channel_has_binding: z.boolean(),
	matches: z.array(epgRulePreviewMatchSchema),
});

/** Schema for a backend-defined programme scheduling result. */
export const epgProgrammeScheduleResultSchema = z.looseObject({});

export const epgSourceListSchema = z.array(epgSourceSchema);
export const epgSourceChannelListSchema = z.array(epgSourceChannelSchema);
export const epgBindingListSchema = z.array(epgBindingSchema);
export const epgBindingCandidateListSchema = z.array(epgBindingCandidateSchema);
export const epgDisplayableChannelListSchema = z.array(
	epgDisplayableChannelSchema,
);
export const epgProgrammeListSchema = z.array(epgProgrammeSchema);
export const epgScheduledProgrammeListSchema = z.array(
	epgScheduledProgrammeSchema,
);
export const epgRuleListSchema = z.array(epgRuleSchema);

export type EpgSourceUrl = z.infer<typeof epgSourceUrlSchema>;
export type EpgSource = z.infer<typeof epgSourceSchema>;
export type EpgSourceChannel = z.infer<typeof epgSourceChannelSchema>;
export type EpgBinding = z.infer<typeof epgBindingSchema>;
export type EpgBindingCandidate = z.infer<typeof epgBindingCandidateSchema>;
export type EpgDisplayableChannel = z.infer<typeof epgDisplayableChannelSchema>;
export type EpgProgramme = z.infer<typeof epgProgrammeSchema>;
export type EpgScheduledProgramme = z.infer<typeof epgScheduledProgrammeSchema>;
export type EpgProgrammeScheduleResult = z.infer<
	typeof epgProgrammeScheduleResultSchema
>;
export type EpgRuleAction = z.infer<typeof epgRuleActionSchema>;
export type EpgRule = z.infer<typeof epgRuleSchema>;
export type EpgRulePreview = z.infer<typeof epgRulePreviewSchema>;
