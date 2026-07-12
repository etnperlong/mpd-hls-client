import { withQuery } from "../internal/query.js";
import {
	type Font,
	type FontList,
	fontListSchema,
	fontSchema,
} from "../schemas/fonts.js";
import { jsonRequest, type Transport } from "../transport.js";
import type { QueryValue, RequestOptions } from "../types.js";

/** Query parameters accepted by the font preview endpoint. */
export interface FontPreviewQuery {
	text?: string;
	size?: number;
	color?: string;
	stroke_color?: string;
	stroke_size?: number;
	canvas_w?: number;
	canvas_h?: number;
	anchor?: string;
	margin_percent?: number;
	char_spacing?: number;
	line_height?: number;
	_?: number;
	[key: string]: QueryValue;
}

/** Options accepted when uploading a font. */
export interface UploadFontOptions extends RequestOptions {
	displayName?: string;
	filename?: string;
}

/** Client for font library management operations. */
export class FontsResource {
	constructor(private readonly transport: Transport) {}

	/** Lists all uploaded fonts. */
	list(options: RequestOptions = {}): Promise<FontList> {
		return this.transport.json("GET", "/api/fonts", fontListSchema, options);
	}

	/** Renames a font's display name. */
	rename(
		id: string,
		displayName: string,
		options: RequestOptions = {},
	): Promise<Font> {
		const request = jsonRequest({ display_name: displayName });
		const headers = new Headers(options.headers);
		new Headers(request.headers).forEach((header, name) => {
			headers.set(name, header);
		});
		return this.transport.json(
			"PUT",
			`/api/fonts/${encodeURIComponent(id)}`,
			fontSchema,
			{ ...options, ...request, headers },
		);
	}

	/** Deletes an uploaded font. */
	delete(id: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"DELETE",
			`/api/fonts/${encodeURIComponent(id)}`,
			options,
		);
	}

	/** Uploads a TTF or OTF font using multipart form data. */
	upload(file: Blob, options: UploadFontOptions = {}): Promise<Font> {
		const form = new FormData();
		if (options.filename !== undefined) {
			form.append("file", file, options.filename);
		} else {
			form.append("file", file);
		}
		if (options.displayName !== undefined) {
			form.append("display_name", options.displayName);
		}
		return this.transport.json("POST", "/api/fonts", fontSchema, {
			signal: options.signal,
			headers: options.headers,
			body: form,
		});
	}

	/** Fetches a rendered font preview as a raw response. */
	preview(
		id: string,
		query: FontPreviewQuery = {},
		options: RequestOptions = {},
	): Promise<Response> {
		return this.transport.response("GET", this.previewUrl(id, query), options);
	}

	/** Builds the relative URL for a rendered font preview. */
	previewUrl(id: string, query: FontPreviewQuery = {}): string {
		return withQuery(`/api/fonts/${encodeURIComponent(id)}/preview`, query);
	}
}
