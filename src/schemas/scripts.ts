import { z } from "zod";

/** Schema for a script reference used by script listings and warnings. */
export const scriptReferenceSchema = z.looseObject({
	stream_key: z.string(),
	name: z.string(),
	stage: z.enum(["source", "key"]),
});

/** A channel reference found in a configured script. */
export type ScriptReference = z.infer<typeof scriptReferenceSchema>;

/** Schema for one configured script file or directory. */
export const scriptEntrySchema = z.looseObject({
	path: z.string(),
	name: z.string(),
	kind: z.enum(["file", "dir"]),
	size_bytes: z.number().int(),
	modified_ms: z.number().int(),
	config_path: z.string(),
	references: z.array(scriptReferenceSchema),
});

/** A configured script file or directory. */
export type ScriptEntry = z.infer<typeof scriptEntrySchema>;

/** Schema for a broken script reference grouping. */
export const brokenScriptReferenceSchema = z.looseObject({
	raw_path: z.string(),
	channels: z.array(scriptReferenceSchema),
});

/** A script reference that could not be resolved. */
export type BrokenScriptReference = z.infer<typeof brokenScriptReferenceSchema>;

/** Schema for the configured scripts listing response. */
export const scriptListingSchema = z.looseObject({
	root: z.string(),
	config_root: z.string(),
	root_exists: z.boolean(),
	items: z.array(scriptEntrySchema),
	broken_references: z.array(brokenScriptReferenceSchema),
});

/** The configured scripts listing response. */
export type ScriptListing = z.infer<typeof scriptListingSchema>;

/** Schema for one script's content and metadata. */
export const scriptContentSchema = z.looseObject({
	path: z.string(),
	config_path: z.string(),
	content: z.string(),
	size_bytes: z.number().int(),
	truncated: z.boolean(),
	modified_ms: z.number().int(),
	references: z.array(scriptReferenceSchema),
});

/** A script's content and metadata. */
export type ScriptContent = z.infer<typeof scriptContentSchema>;

/** Schema for the confirmed script-content save response fields. */
export const scriptSaveResultSchema = z.looseObject({
	size_bytes: z.number().int(),
	modified_ms: z.number().int(),
});

/** Metadata returned after saving script content. */
export type ScriptSaveResult = z.infer<typeof scriptSaveResultSchema>;

/** Schema for one skipped script upload. */
export const skippedScriptUploadSchema = z.looseObject({
	name: z.string(),
	reason: z.string(),
});

/** Schema for the script upload response. */
export const scriptUploadResultSchema = z.looseObject({
	uploaded: z.array(z.unknown()),
	skipped: z.array(skippedScriptUploadSchema),
});

/** Result returned after uploading scripts. */
export type ScriptUploadResult = z.infer<typeof scriptUploadResultSchema>;
