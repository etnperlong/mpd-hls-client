import { withQuery } from "../internal/query.js";
import {
	type EpgRule,
	type EpgRulePreview,
	epgRuleListSchema,
	epgRulePreviewSchema,
	epgRuleSchema,
} from "../schemas/epg.js";
import { jsonOptions } from "../transport.js";
import type { RequestOptions } from "../types.js";
import { EpgProgrammesResource } from "./epg-programmes.js";
import type { EpgRuleInput, EpgRuleUpdate } from "./epg-shared.js";

/** Client for EPG keyword-rule operations. */
export class EpgRulesResource extends EpgProgrammesResource {
	/** Lists EPG keyword rules. */
	listRules(options: RequestOptions = {}): Promise<EpgRule[]> {
		return this.transport.json(
			"GET",
			"/api/epg/rules",
			epgRuleListSchema,
			options,
		);
	}

	/** Creates an EPG keyword rule. */
	createRule(
		input: EpgRuleInput,
		options: RequestOptions = {},
	): Promise<EpgRule> {
		return this.transport.json(
			"POST",
			"/api/epg/rules",
			epgRuleSchema,
			jsonOptions(input, options),
		);
	}

	/** Returns an EPG keyword rule. */
	getRule(id: string, options: RequestOptions = {}): Promise<EpgRule> {
		return this.transport.json(
			"GET",
			`/api/epg/rules/${encodeURIComponent(id)}`,
			epgRuleSchema,
			options,
		);
	}

	/** Updates selected fields of an EPG keyword rule. */
	updateRule(
		id: string,
		input: EpgRuleUpdate,
		options: RequestOptions = {},
	): Promise<EpgRule> {
		return this.transport.json(
			"PUT",
			`/api/epg/rules/${encodeURIComponent(id)}`,
			epgRuleSchema,
			jsonOptions(input, options),
		);
	}

	/** Deletes an EPG keyword rule. */
	deleteRule(id: string, options: RequestOptions = {}): Promise<void> {
		return this.transport.void(
			"DELETE",
			`/api/epg/rules/${encodeURIComponent(id)}`,
			options,
		);
	}

	/** Previews programmes matched by an EPG keyword rule. */
	previewRule(
		id: string,
		horizonHours?: number,
		options: RequestOptions = {},
	): Promise<EpgRulePreview> {
		const path = withQuery(`/api/epg/rules/${encodeURIComponent(id)}/preview`, {
			horizon_hours: horizonHours,
		});
		return this.transport.json("POST", path, epgRulePreviewSchema, options);
	}
}
