import { z } from "zod";

/** Schema for an API response containing an item list. */
export function itemListSchema<T extends z.ZodType>(item: T) {
	return z.looseObject({ items: z.array(item) });
}

/** Schema for a paginated API response. */
export function paginatedSchema<T extends z.ZodType>(item: T) {
	return z.looseObject({
		items: z.array(item),
		total: z.number().int().nonnegative(),
		page: z.number().int().positive(),
		per_page: z.number().int().positive(),
	});
}

/** Schema for arbitrary JSON object payloads. */
export const unknownObjectSchema = z.looseObject({});

/** Schema for arbitrary JSON values. */
export const unknownJsonSchema = z.json();
