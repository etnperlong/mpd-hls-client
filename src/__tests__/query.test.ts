import { describe, expect, it } from "bun:test";
import { withQuery } from "../internal/query";

describe("withQuery", () => {
	it("encodes defined values and preserves false", () => {
		expect(
			withQuery("/api/channels", {
				search: "新闻 & 体育",
				page: 2,
				enabled: false,
				missing: undefined,
			}),
		).toBe(
			"/api/channels?search=%E6%96%B0%E9%97%BB+%26+%E4%BD%93%E8%82%B2&page=2&enabled=false",
		);
	});

	it("returns the original path for an empty query", () => {
		expect(withQuery("/healthz", {})).toBe("/healthz");
	});
});
