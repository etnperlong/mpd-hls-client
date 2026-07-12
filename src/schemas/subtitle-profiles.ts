import { z } from "zod";
import { itemListSchema } from "./common.js";

/** Schema for PGS subtitle rendering settings. */
export const subtitlePgsSettingsSchema = z.looseObject({
	font_id: z.string().nullish(),
	font_size: z.number().nullish(),
	text_color: z.string().nullish(),
	stroke_color: z.string().nullish(),
	stroke_size: z.number().nullish(),
	video_width: z.number().int().nullish(),
	video_height: z.number().int().nullish(),
	position: z
		.looseObject({
			anchor: z.string().optional(),
			margin_percent: z.number().optional(),
		})
		.optional(),
	char_spacing: z.number().nullish(),
	line_height: z.number().nullish(),
});

/** Schema for WebVTT subtitle settings. */
export const subtitleVttSettingsSchema = z.looseObject({
	enable_ocr: z.boolean().optional(),
});

/** Schema for a subtitle profile returned by the API. */
export const subtitleProfileSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	pgs: subtitlePgsSettingsSchema.optional(),
	vtt: subtitleVttSettingsSchema.optional(),
});

/** Schema for a subtitle profile list response. */
export const subtitleProfileListSchema = itemListSchema(subtitleProfileSchema);

/** Subtitle profile returned by the API. */
export type SubtitleProfile = z.infer<typeof subtitleProfileSchema>;

/** Subtitle profile list returned by the API. */
export type SubtitleProfileList = z.infer<typeof subtitleProfileListSchema>;

/** Wire payload used to create a subtitle profile. */
export interface CreateSubtitleProfileInput {
	name: string;
	[key: string]: unknown;
}

/** Wire payload used to update a subtitle profile. */
export interface UpdateSubtitleProfileInput {
	name?: string;
	pgs?: z.infer<typeof subtitlePgsSettingsSchema>;
	vtt?: z.infer<typeof subtitleVttSettingsSchema>;
	[key: string]: unknown;
}
