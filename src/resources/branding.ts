import { type Branding, brandingSchema } from "../schemas/branding.js";
import type { Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Client-only fields accepted when replacing site branding. */
export interface BrandingUpdateInput {
	siteName: string;
	icon?: Blob;
	removeIcon?: boolean;
}

/** Client for site branding operations. */
export class BrandingResource {
	constructor(private readonly transport: Transport) {}

	/** Reads the current site branding. */
	get(options: RequestOptions = {}): Promise<Branding> {
		return this.transport.json("GET", "/api/branding", brandingSchema, options);
	}

	/** Replaces site branding using multipart form data. */
	update(
		input: BrandingUpdateInput,
		options: RequestOptions = {},
	): Promise<Branding> {
		const form = new FormData();
		form.append("site_name", input.siteName);
		if (input.icon !== undefined) form.append("icon", input.icon);
		if (input.removeIcon) form.append("remove_icon", "true");
		return this.transport.json("PUT", "/api/branding", brandingSchema, {
			signal: options.signal,
			headers: options.headers,
			body: form,
		});
	}

	/** Resets site branding to defaults and returns the resulting branding. */
	reset(options: RequestOptions = {}): Promise<Branding> {
		return this.transport.json(
			"DELETE",
			"/api/branding",
			brandingSchema,
			options,
		);
	}

	/** Builds the relative URL for the current branding icon. */
	iconUrl(): string {
		return "/api/branding/icon";
	}
}
