import { z } from "zod";
import { itemListSchema } from "./common.js";

/** Schema for a font returned by the API. */
export const fontSchema = z.looseObject({
	id: z.string(),
	display_name: z.string(),
	filename: z.string().optional(),
	format: z.string().optional(),
	size_bytes: z.number().int().nonnegative().optional(),
	uploaded_at_ms: z.number().optional(),
});

/** Schema for a font list response. */
export const fontListSchema = itemListSchema(fontSchema);

/** Font metadata returned by the API. */
export type Font = z.infer<typeof fontSchema>;

/** Font list returned by the API. */
export type FontList = z.infer<typeof fontListSchema>;
