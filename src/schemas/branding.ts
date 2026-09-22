import { z } from "zod";

/** Schema for site branding returned by the management API. */
export const brandingSchema = z.looseObject({
	site_name: z.string(),
	icon_url: z.string(),
	custom_icon: z.boolean(),
});

/** Site branding returned by the management API. */
export type Branding = z.infer<typeof brandingSchema>;
