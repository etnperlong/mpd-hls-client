import { z } from "zod";
import { itemListSchema } from "./common.js";

/** Schema for a filename template returned by the API. */
export const filenameTemplateSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	body: z.string(),
});

/** Schema for a filename template list response. */
export const filenameTemplateListSchema = itemListSchema(
	filenameTemplateSchema,
);

/** Filename template returned by the API. */
export type FilenameTemplate = z.infer<typeof filenameTemplateSchema>;

/** Filename template list returned by the API. */
export type FilenameTemplateList = z.infer<typeof filenameTemplateListSchema>;

/** Wire payload used to create a filename template. */
export interface CreateFilenameTemplateInput {
	name: string;
	body: string;
	[key: string]: unknown;
}

/** Wire payload used to update a filename template. */
export interface UpdateFilenameTemplateInput {
	name?: string;
	body?: string;
	[key: string]: unknown;
}
