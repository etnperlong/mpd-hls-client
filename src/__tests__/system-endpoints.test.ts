import { describe, expect, it } from "bun:test";
import {
	createSystemResource,
	metricsResponse,
	tuningDefaultsResponse,
	whoAmIResponse,
} from "./helpers/system";

describe("SystemResource endpoints", () => {
	it("uses authenticated GET requests for all system endpoints", async () => {
		const { resource, requests } = createSystemResource([
			metricsResponse,
			whoAmIResponse,
			tuningDefaultsResponse,
		]);

		const metrics = await resource.metrics();
		const identity = await resource.whoAmI();
		const defaults = await resource.getTuningDefaults();

		expect(requests.map(({ url }) => new URL(url).pathname)).toEqual([
			"/api/metrics",
			"/api/me",
			"/api/config/tuning-defaults",
		]);
		for (const { init } of requests) {
			expect(init?.method).toBe("GET");
			expect(new Headers(init?.headers).get("Cookie")).toBe(
				"mpd_hls_session=session-value; mpd_hls_csrf=csrf-value",
			);
		}
		expect(metrics.active_sessions[0]).toEqual({
			session_id: "future-session",
			future_state: { value: 1 },
		});
		expect(metrics.future_metric).toBe("preserved");
		expect(identity.capabilities).toEqual(["admin", "channels.manage"]);
		expect(identity.future_identity_field).toBe(true);
		expect(defaults.future_tuning_field).toBe("preserved");
	});
});
