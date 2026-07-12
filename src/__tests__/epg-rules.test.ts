import { describe, expect, it } from "bun:test";
import type { EpgRuleInput } from "../resources/epg";
import { createEpgResource } from "./helpers/epg";

const rule = {
	id: "rule-1",
	name: "Record news",
	stream_key: "stream/one",
	condition: { type: "contains" as const, text: "news" },
	action: {
		type: "record" as const,
		output_dir: null,
		task_name_template: "{program.title}",
	},
	lead_secs: 60,
	tail_secs: 60,
	enabled: true,
	created_at_ms: 1_700_000_000_000,
	updated_at_ms: 1_700_000_000_001,
};

describe("EpgResource rules", () => {
	it("covers rule CRUD with recursive conditions and partial updates", async () => {
		const input: EpgRuleInput = {
			name: rule.name,
			stream_key: rule.stream_key,
			condition: {
				type: "all",
				conditions: [
					{ type: "contains", text: "news" },
					{ type: "not", condition: { type: "contains", text: "repeat" } },
				],
			},
			action: rule.action,
			lead_secs: 60,
			tail_secs: 60,
		};
		const createdRule = { ...rule, condition: input.condition };
		const { resource, calls } = createEpgResource([
			[rule],
			createdRule,
			rule,
			{ ...rule, enabled: false },
			undefined,
		]);

		await resource.listRules();
		await resource.createRule(input);
		await resource.getRule("rule/1");
		await resource.updateRule("rule/1", { enabled: false });
		await resource.deleteRule("rule/1");

		expect(calls).toEqual([
			{
				url: "https://example.test/root/api/epg/rules",
				method: "GET",
				body: undefined,
			},
			{
				url: "https://example.test/root/api/epg/rules",
				method: "POST",
				body: input,
			},
			{
				url: "https://example.test/root/api/epg/rules/rule%2F1",
				method: "GET",
				body: undefined,
			},
			{
				url: "https://example.test/root/api/epg/rules/rule%2F1",
				method: "PUT",
				body: { enabled: false },
			},
			{
				url: "https://example.test/root/api/epg/rules/rule%2F1",
				method: "DELETE",
				body: undefined,
			},
		]);
	});

	it("posts rule previews with the horizon_hours query", async () => {
		const { resource, calls } = createEpgResource([
			{
				channel_has_binding: true,
				matches: [
					{
						title: "Evening News",
						start_ms: 1000,
						stop_ms: 2000,
						retained: true,
					},
				],
			},
		]);
		const result = await resource.previewRule("rule/1", 72);

		expect(result.matches[0]?.retained).toBe(true);
		expect(calls).toEqual([
			{
				url: "https://example.test/root/api/epg/rules/rule%2F1/preview?horizon_hours=72",
				method: "POST",
				body: undefined,
			},
		]);
	});
});
