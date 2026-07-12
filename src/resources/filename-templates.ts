import {
	type CreateFilenameTemplateInput,
	type FilenameTemplate,
	type FilenameTemplateList,
	filenameTemplateListSchema,
	filenameTemplateSchema,
	type UpdateFilenameTemplateInput,
} from "../schemas/filename-templates.js";
import { jsonRequest, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

function jsonOptions(value: unknown, options: RequestOptions) {
	const request = jsonRequest(value);
	const headers = new Headers(options.headers);
	new Headers(request.headers).forEach((header, name) => {
		headers.set(name, header);
	});
	return { ...options, ...request, headers };
}

/** Client for filename template management operations. */
export class FilenameTemplatesResource {
	constructor(private readonly transport: Transport) {}

	/** Lists all filename templates. */
	list(options: RequestOptions = {}): Promise<FilenameTemplateList> {
		return this.transport.json(
			"GET",
			"/api/filename-templates",
			filenameTemplateListSchema,
			options,
		);
	}

	/** Creates a filename template. */
	create(
		input: CreateFilenameTemplateInput,
		options: RequestOptions = {},
	): Promise<FilenameTemplate> {
		return this.transport.json(
			"POST",
			"/api/filename-templates",
			filenameTemplateSchema,
			jsonOptions(input, options),
		);
	}

	/** Updates a filename template. */
	update(
		id: string,
		input: UpdateFilenameTemplateInput,
		options: RequestOptions = {},
	): Promise<FilenameTemplate> {
		return this.transport.json(
			"PUT",
			`/api/filename-templates/${encodeURIComponent(id)}`,
			filenameTemplateSchema,
			jsonOptions(input, options),
		);
	}

	/** Deletes a filename template. */
	delete(id: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"DELETE",
			`/api/filename-templates/${encodeURIComponent(id)}`,
			options,
		);
	}
}
