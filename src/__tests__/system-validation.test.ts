import { describe, expect, it } from "bun:test";
import { MpdHlsResponseValidationError } from "../errors";
import type { SystemResource } from "../resources/system";
import { createSystemResource } from "./helpers/system";

describe("SystemResource validation", () => {
	it("validates every JSON response", async () => {
		const cases = [
			{
				invoke: (resource: SystemResource) => resource.metrics(),
				body: { ok: true },
			},
			{
				invoke: (resource: SystemResource) => resource.whoAmI(),
				body: { role: "admin" },
			},
			{
				invoke: (resource: SystemResource) => resource.playlistLink(),
				body: { url: 123 },
			},
			{
				invoke: (resource: SystemResource) => resource.getTuningDefaults(),
				body: { startup_timeout_ms: "8000" },
			},
		];

		for (const { invoke, body } of cases) {
			const { resource } = createSystemResource([body]);
			expect(invoke(resource)).rejects.toBeInstanceOf(
				MpdHlsResponseValidationError,
			);
		}
	});
});
