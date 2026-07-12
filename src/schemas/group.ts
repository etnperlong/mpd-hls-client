import { z } from "zod";
import { itemListSchema, unknownObjectSchema } from "./common.js";

/** Schema for a group returned by the management API. */
export const GroupSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	upstream_proxy_url: z.string().nullable().optional(),
	user_agent: z.string().nullable().optional(),
	upstream_headers: z.unknown().optional(),
	force_ipv6: z.boolean().nullable().optional(),
	force_manifest_query: z.boolean().nullable().optional(),
	subtitle_profile_id: z.string().nullable().optional(),
	tuning: z.looseObject({}).optional(),
	channel_count: z.number().int().nonnegative().optional(),
});

/** Schema for a response containing groups. */
export const GroupListSchema = itemListSchema(GroupSchema);

const ExportedGroupSchema = z.looseObject({
	name: z.string(),
	upstream_proxy_url: z.string().nullable().optional(),
	tuning: z.looseObject({}).optional(),
});

/** Schema for an exported group and its channels. */
export const GroupExportSchema = z.looseObject({
	group: ExportedGroupSchema,
	channels: z.array(z.looseObject({})),
});

/** Schema for a group import response. */
export const GroupImportResultSchema = z.looseObject({
	group: GroupSchema,
	channels: itemListSchema(z.looseObject({})).optional(),
});

/** Schema for JSON acknowledgements returned by group ordering operations. */
export const GroupOperationResultSchema = unknownObjectSchema;

export type Group = z.infer<typeof GroupSchema>;
export type GroupList = z.infer<typeof GroupListSchema>;
export type GroupExport = z.infer<typeof GroupExportSchema>;
export type GroupImportResult = z.infer<typeof GroupImportResultSchema>;
export type GroupOperationResult = z.infer<typeof GroupOperationResultSchema>;
