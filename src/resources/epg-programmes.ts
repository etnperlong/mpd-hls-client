import {
	type EpgProgramme,
	type EpgProgrammeScheduleResult,
	type EpgScheduledProgramme,
	epgProgrammeListSchema,
	epgProgrammeScheduleResultSchema,
	epgScheduledProgrammeListSchema,
} from "../schemas/epg.js";
import { jsonOptions } from "../transport.js";
import type { RequestOptions } from "../types.js";
import type {
	EpgProgrammeQuery,
	EpgProgrammeScheduleInput,
} from "./epg-shared.js";
import { EpgSourcesResource } from "./epg-sources.js";

/** Client for EPG programme operations. */
export class EpgProgrammesResource extends EpgSourcesResource {
	/** Queries programmes for streams over a millisecond time range. */
	listProgrammes(
		query: EpgProgrammeQuery,
		options: RequestOptions = {},
	): Promise<EpgProgramme[]> {
		const body = {
			channels: query.channels?.length ? query.channels : undefined,
			from: query.from,
			to: query.to,
			include_desc: query.includeDesc ?? false,
		};
		return this.transport.json(
			"POST",
			"/api/epg/programmes",
			epgProgrammeListSchema,
			jsonOptions(body, options),
		);
	}

	/** Schedules an action for an EPG programme. */
	scheduleProgramme(
		input: EpgProgrammeScheduleInput,
		options: RequestOptions = {},
	): Promise<EpgProgrammeScheduleResult> {
		return this.transport.json(
			"POST",
			"/api/epg/programmes/schedule",
			epgProgrammeScheduleResultSchema,
			jsonOptions(input, options),
		);
	}

	/** Lists scheduled programme entries for a stream. */
	listScheduledProgrammes(
		streamKey: string,
		options: RequestOptions = {},
	): Promise<EpgScheduledProgramme[]> {
		return this.transport.json(
			"GET",
			`/api/epg/programmes/scheduled/${encodeURIComponent(streamKey)}`,
			epgScheduledProgrammeListSchema,
			options,
		);
	}
}
