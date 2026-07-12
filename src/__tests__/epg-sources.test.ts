import { describe, expect, it } from "bun:test";
import type { EpgSourceInput } from "../resources/epg";
import { createEpgResource } from "./helpers/epg";

const source = {
	id: "source-1",
	name: "Primary",
	urls: [{ url: "https://epg.test/guide.xml", priority: 0 }],
	refresh_secs: 21_600,
	priority: 0,
	enabled: true,
	created_at_ms: 1_700_000_000_000,
	updated_at_ms: 1_700_000_000_001,
	extra_state: { retained: true },
};

describe("EpgResource sources", () => {
	it("covers source CRUD and refresh paths", async () => {
		const input: EpgSourceInput = {
			name: "Primary",
			urls: [{ url: "https://epg.test/guide.xml", priority: 0 }],
			refresh_secs: 21_600,
			priority: 0,
		};
		const { resource, calls } = createEpgResource([
			[source],
			source,
			source,
			undefined,
			undefined,
		]);

		const listed = await resource.listSources();
		await resource.createSource(input);
		await resource.updateSource("source/1", input);
		await resource.deleteSource("source/1");
		await resource.refreshSource("source/1");

		expect(listed[0]?.extra_state).toEqual({ retained: true });
		expect(calls).toEqual([
			{
				url: "https://example.test/root/api/epg/sources",
				method: "GET",
				body: undefined,
			},
			{
				url: "https://example.test/root/api/epg/sources",
				method: "POST",
				body: input,
			},
			{
				url: "https://example.test/root/api/epg/sources/source%2F1",
				method: "PUT",
				body: input,
			},
			{
				url: "https://example.test/root/api/epg/sources/source%2F1",
				method: "DELETE",
				body: undefined,
			},
			{
				url: "https://example.test/root/api/epg/sources/source%2F1/refresh",
				method: "POST",
				body: undefined,
			},
		]);
	});
});
