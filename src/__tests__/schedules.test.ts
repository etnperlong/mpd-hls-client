import { describe, expect, it } from "bun:test";
import { MpdHlsResponseValidationError } from "../errors";
import { SchedulesResource } from "../resources/schedules";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

const schedule = {
	id: "schedule-1",
	name: "Evening recording",
	stream_key: "news-hd",
	action: {
		type: "record" as const,
		spec: {
			duration_secs: 1800,
			pre_buffer_secs: 5,
			post_buffer_secs: 60,
			output_dir: null,
			task_name_template: "{channel}-{date}",
			future_spec_field: true,
		},
	},
	kind: { type: "daily" as const, hour: 20, minute: 30 },
	enabled: true,
	created_at_ms: 1_700_000_000_000,
	updated_at_ms: 1_700_000_001_000,
	last_run_ms: null,
	last_error: null,
	source: { type: "manual", future_source_field: 1 },
	timezone: "UTC",
	stream_name: "News HD",
	next_run_ms: 1_700_086_400_000,
	future_schedule_field: "preserved",
};

function createResource(responses: unknown[]) {
	const requests: Array<{ url: string; init: RequestInit | undefined }> = [];
	const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		requests.push({ url: input.toString(), init });
		return new Response(JSON.stringify(responses.shift()), {
			headers: { "Content-Type": "application/json" },
		});
	};
	const transport = new Transport({
		baseUrl: "https://example.test/",
		auth: { username: "api-user", password: "api-password" },
		fetch: fetch as typeof globalThis.fetch,
		session: TEST_SESSION,
	});
	return { resource: new SchedulesResource(transport), requests };
}

describe("SchedulesResource", () => {
	it("implements every schedule endpoint with the wire payload", async () => {
		const meta = {
			server_time_ms: 100,
			next_run_ms: 200,
			next_run_schedule_id: "schedule-1",
			missed_once_count: 0,
		};
		const preview = { next_runs: [200, 300, 400], future_preview_field: true };
		const { resource, requests } = createResource([
			{ items: [schedule], future_list_field: true },
			schedule,
			meta,
			preview,
			schedule,
			schedule,
			{},
			schedule,
			schedule,
			{ id: "run-1", future_run_field: true },
		]);
		const createInput = {
			name: "Evening recording",
			stream_key: "news-hd",
			action: schedule.action,
			kind: schedule.kind,
			timezone: "UTC",
		};

		const listed = await resource.list("stream /key");
		await resource.get("schedule /1");
		await resource.meta();
		const previewed = await resource.preview(schedule.kind, "UTC");
		await resource.create(createInput);
		await resource.update("schedule /1", {
			name: "Renamed",
			clear_error: true,
		});
		await resource.delete("schedule /1");
		await resource.enable("schedule /1");
		await resource.disable("schedule /1");
		const run = await resource.runNow("schedule /1");

		expect(requests.map(({ url }) => new URL(url).pathname)).toEqual([
			"/api/schedules",
			"/api/schedules/schedule%20%2F1",
			"/api/schedules/meta",
			"/api/schedules/preview",
			"/api/schedules",
			"/api/schedules/schedule%20%2F1",
			"/api/schedules/schedule%20%2F1",
			"/api/schedules/schedule%20%2F1/enable",
			"/api/schedules/schedule%20%2F1/disable",
			"/api/schedules/schedule%20%2F1/run-now",
		]);
		expect(new URL(requests[0]?.url ?? "").searchParams.get("stream_key")).toBe(
			"stream /key",
		);
		expect(requests.map(({ init }) => init?.method)).toEqual([
			"GET",
			"GET",
			"GET",
			"POST",
			"POST",
			"PUT",
			"DELETE",
			"POST",
			"POST",
			"POST",
		]);
		expect(JSON.parse(String(requests[3]?.init?.body))).toEqual({
			kind: schedule.kind,
			timezone: "UTC",
		});
		expect(JSON.parse(String(requests[4]?.init?.body))).toEqual(createInput);
		expect(JSON.parse(String(requests[5]?.init?.body))).toEqual({
			name: "Renamed",
			clear_error: true,
		});
		expect(listed.items[0]?.future_schedule_field).toBe("preserved");
		expect(previewed.future_preview_field).toBe(true);
		expect(run).toEqual({ id: "run-1", future_run_field: true });
	});

	it("validates schedule JSON responses", () => {
		const { resource } = createResource([{ id: "incomplete" }]);
		expect(resource.get("incomplete")).rejects.toBeInstanceOf(
			MpdHlsResponseValidationError,
		);
	});
});
