import {
	type CreateSubtitleProfileInput,
	type SubtitleProfile,
	type SubtitleProfileList,
	subtitleProfileListSchema,
	subtitleProfileSchema,
	type UpdateSubtitleProfileInput,
} from "../schemas/subtitle-profiles.js";
import { jsonOptions, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Client for subtitle profile management operations. */
export class SubtitleProfilesResource {
	constructor(private readonly transport: Transport) {}

	/** Lists all subtitle profiles. */
	list(options: RequestOptions = {}): Promise<SubtitleProfileList> {
		return this.transport.json(
			"GET",
			"/api/subtitle-profiles",
			subtitleProfileListSchema,
			options,
		);
	}

	/** Creates a subtitle profile. */
	create(
		input: CreateSubtitleProfileInput,
		options: RequestOptions = {},
	): Promise<SubtitleProfile> {
		return this.transport.json(
			"POST",
			"/api/subtitle-profiles",
			subtitleProfileSchema,
			jsonOptions(input, options),
		);
	}

	/** Updates a subtitle profile. */
	update(
		id: string,
		input: UpdateSubtitleProfileInput,
		options: RequestOptions = {},
	): Promise<SubtitleProfile> {
		return this.transport.json(
			"PUT",
			`/api/subtitle-profiles/${encodeURIComponent(id)}`,
			subtitleProfileSchema,
			jsonOptions(input, options),
		);
	}

	/** Clones a subtitle profile. */
	clone(id: string, options: RequestOptions = {}): Promise<SubtitleProfile> {
		return this.transport.json(
			"POST",
			`/api/subtitle-profiles/${encodeURIComponent(id)}/clone`,
			subtitleProfileSchema,
			options,
		);
	}

	/** Deletes a subtitle profile. */
	delete(id: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"DELETE",
			`/api/subtitle-profiles/${encodeURIComponent(id)}`,
			options,
		);
	}
}
