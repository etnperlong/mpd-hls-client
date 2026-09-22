import { describe, expect, it } from "bun:test";
import { MpdHlsResponseValidationError } from "../errors";
import { RecordingsResource } from "../resources/recordings";
import { Transport } from "../transport";
import { TEST_SESSION } from "./helpers/session";

const recording = {
	id: "recording-1",
	name: "Evening news",
	stream_key: "news-hd",
	status: "done",
	channel_name: "News HD",
	schedule_id: null,
	planned_start_ms: 1_700_000_000_000,
	planned_stop_ms: 1_700_003_600_000,
	actual_start_wallclock_ms: 1_700_000_001_000,
	actual_stop_wallclock_ms: 1_700_003_601_000,
	captured_segments: 450,
	bytes_staged: 10_000,
	output_bytes: 9_000,
	output_file: "/recordings/evening.mp4",
	files: [
		{
			name: "evening.mp4",
			kind: "video",
			size_bytes: 9_000,
			future_file_field: true,
		},
	],
	interrupted_reason: null,
	error: null,
	future_recording_field: { value: true },
};

function createResource(responses: Array<unknown | Response>) {
	const requests: Array<{ url: string; init: RequestInit | undefined }> = [];
	const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		requests.push({ url: input.toString(), init });
		const response = responses.shift();
		if (response instanceof Response) return response;
		return new Response(JSON.stringify(response), {
			headers: { "Content-Type": "application/json" },
		});
	};
	const transport = new Transport({
		baseUrl: "https://example.test/",
		auth: { username: "api-user", password: "api-password" },
		fetch: fetch as typeof globalThis.fetch,
		session: TEST_SESSION,
	});
	return { resource: new RecordingsResource(transport), requests };
}

describe("RecordingsResource", () => {
	it("implements task operations and preserves wire field names", async () => {
		const config = {
			default_output_dir: "/recordings/finished",
			staging_dir: "/recordings/staging",
			future_config_field: true,
		};
		const downloadResponse = new Response("recording-bytes", {
			headers: { "Content-Type": "video/mp4" },
		});
		const { resource, requests } = createResource([
			{ items: [recording], future_list_field: true },
			recording,
			recording,
			{},
			{},
			{},
			{},
			config,
			downloadResponse,
		]);
		const input = {
			stream_key: "news-hd",
			name: "Evening news",
			duration_secs: 3600,
			output_dir: null,
		};

		const listed = await resource.list();
		await resource.get("recording /1");
		await resource.create(input);
		await resource.cancel("recording /1", "manual");
		await resource.retryFinalize("recording /1");
		await resource.delete("recording /1");
		await resource.delete("recording /1", true);
		const configured = await resource.config();
		const downloaded = await resource.download(
			"recording /1",
			"video main.mp4",
		);

		expect(requests.map(({ url }) => new URL(url).pathname)).toEqual([
			"/api/recording/tasks",
			"/api/recording/tasks/recording%20%2F1",
			"/api/recording/tasks",
			"/api/recording/tasks/recording%20%2F1/cancel",
			"/api/recording/tasks/recording%20%2F1/retry-finalize",
			"/api/recording/tasks/recording%20%2F1",
			"/api/recording/tasks/recording%20%2F1",
			"/api/recording/config",
			"/api/recording/tasks/recording%20%2F1/download",
		]);
		expect(requests.map(({ init }) => init?.method)).toEqual([
			"GET",
			"GET",
			"POST",
			"POST",
			"POST",
			"DELETE",
			"DELETE",
			"GET",
			"GET",
		]);
		expect(JSON.parse(String(requests[2]?.init?.body))).toEqual(input);
		expect(JSON.parse(String(requests[3]?.init?.body))).toEqual({
			reason: "manual",
		});
		expect(new URL(requests[5]?.url ?? "").search).toBe("");
		expect(
			new URL(requests[6]?.url ?? "").searchParams.get("delete_file"),
		).toBe("true");
		expect(new URL(requests[8]?.url ?? "").searchParams.get("file")).toBe(
			"video main.mp4",
		);
		expect(listed.items[0]?.future_recording_field).toEqual({ value: true });
		expect(configured.future_config_field).toBe(true);
		expect(downloaded).toBe(downloadResponse);
		expect(await downloaded.text()).toBe("recording-bytes");
	});

	it("sends a null cancellation reason by default", async () => {
		const { resource, requests } = createResource([{}]);
		await resource.cancel("recording-1");
		expect(JSON.parse(String(requests[0]?.init?.body))).toEqual({
			reason: null,
		});
	});

	it("validates recording JSON responses", () => {
		const { resource } = createResource([{ id: "incomplete" }]);
		expect(resource.get("incomplete")).rejects.toBeInstanceOf(
			MpdHlsResponseValidationError,
		);
	});
});
