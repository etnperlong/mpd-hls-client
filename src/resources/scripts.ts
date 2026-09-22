import { withQuery } from "../internal/query.js";
import { unknownObjectSchema } from "../schemas/common.js";
import {
	type ScriptContent,
	type ScriptListing,
	type ScriptSaveResult,
	type ScriptUploadResult,
	scriptContentSchema,
	scriptListingSchema,
	scriptSaveResultSchema,
	scriptUploadResultSchema,
} from "../schemas/scripts.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Client-only options accepted by script uploads. */
export interface ScriptUploadOptions {
	dir?: string;
	overwrite?: boolean;
}

/** Client for configured script file and directory operations. */
export class ScriptsResource {
	constructor(private readonly transport: Transport) {}

	/** Lists configured scripts and directories. */
	list(options: RequestOptions = {}): Promise<ScriptListing> {
		return this.transport.json(
			"GET",
			"/api/scripts",
			scriptListingSchema,
			options,
		);
	}

	/** Reads one configured script's content. */
	getContent(
		path: string,
		options: RequestOptions = {},
	): Promise<ScriptContent> {
		return this.transport.json(
			"GET",
			withQuery("/api/scripts/content", { path }),
			scriptContentSchema,
			options,
		);
	}

	/** Saves one configured script's content. */
	saveContent(
		path: string,
		content: string,
		options: RequestOptions = {},
	): Promise<ScriptSaveResult> {
		return this.transport.json(
			"PUT",
			"/api/scripts/content",
			scriptSaveResultSchema,
			jsonOptions({ path, content }, options),
		);
	}

	/** Creates a configured script directory. */
	createDirectory(
		path: string,
		options: RequestOptions = {},
	): Promise<Record<string, unknown>> {
		return this.transport.json(
			"POST",
			"/api/scripts/dir",
			unknownObjectSchema,
			jsonOptions({ path }, options),
		);
	}

	/** Creates a configured script file. */
	createFile(
		path: string,
		content = "",
		options: RequestOptions = {},
	): Promise<Record<string, unknown>> {
		return this.transport.json(
			"POST",
			"/api/scripts/file",
			unknownObjectSchema,
			jsonOptions({ path, content }, options),
		);
	}

	/** Renames a configured script file or directory. */
	rename(
		from: string,
		to: string,
		force = false,
		options: RequestOptions = {},
	): Promise<Record<string, unknown>> {
		return this.transport.json(
			"POST",
			"/api/scripts/rename",
			unknownObjectSchema,
			jsonOptions({ from, to, force }, options),
		);
	}

	/** Uploads one or more configured script files as multipart form data. */
	upload(
		files: readonly Blob[],
		uploadOptions: ScriptUploadOptions = {},
		options: RequestOptions = {},
	): Promise<ScriptUploadResult> {
		const form = new FormData();
		for (const file of files) form.append("file", file);
		const dir = uploadOptions.dir?.trim();
		if (dir) form.append("dir", dir);
		if (uploadOptions.overwrite) form.append("overwrite", "true");
		return this.transport.json(
			"POST",
			"/api/scripts/upload",
			scriptUploadResultSchema,
			{
				signal: options.signal,
				headers: options.headers,
				body: form,
			},
		);
	}

	/** Deletes one configured script file or directory. */
	delete(
		path: string,
		force = false,
		options: RequestOptions = {},
	): Promise<void> {
		return this.transport.void(
			"DELETE",
			withQuery("/api/scripts", {
				path,
				force: force ? "true" : undefined,
			}),
			options,
		);
	}
}
