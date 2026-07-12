import { describe, expect, it } from "bun:test";
import { createEpgResource } from "./helpers/epg";

describe("EpgResource programmes", () => {
	it("maps programme query controls and covers scheduling endpoints", async () => {
		const programme = {
			stream_key: "stream/one",
			title: "Evening News",
			start_ms: 1_700_000_000_000,
			stop_ms: 1_700_003_600_000,
			desc: null,
		};
		const scheduleInput = {
			stream_key: "stream/one",
			start_ms: programme.start_ms,
			action: "record",
		};
		const { resource, calls } = createEpgResource([
			[programme],
			{ schedule_id: "schedule-1" },
			[{ schedule_id: "schedule-1", backend_field: true }],
			[],
		]);

		await resource.listProgrammes({
			channels: ["stream/one"],
			from: 1_700_000_000_000,
			to: 1_700_086_400_000,
			includeDesc: true,
		});
		const scheduled = await resource.scheduleProgramme(scheduleInput);
		const listed = await resource.listScheduledProgrammes("stream/one");
		await resource.listProgrammes({ channels: [], from: 1, to: 2 });

		expect(scheduled.schedule_id).toBe("schedule-1");
		expect(listed[0]?.backend_field).toBe(true);
		expect(calls).toEqual([
			{
				url: "https://example.test/root/api/epg/programmes",
				method: "POST",
				body: {
					channels: ["stream/one"],
					from: 1_700_000_000_000,
					to: 1_700_086_400_000,
					include_desc: true,
				},
			},
			{
				url: "https://example.test/root/api/epg/programmes/schedule",
				method: "POST",
				body: scheduleInput,
			},
			{
				url: "https://example.test/root/api/epg/programmes/scheduled/stream%2Fone",
				method: "GET",
				body: undefined,
			},
			{
				url: "https://example.test/root/api/epg/programmes",
				method: "POST",
				body: { from: 1, to: 2, include_desc: false },
			},
		]);
	});
});
