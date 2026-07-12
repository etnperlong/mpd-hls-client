import { describe, expect, it } from "bun:test";
import { encodeBasicAuth } from "../auth";

describe("encodeBasicAuth", () => {
	it("encodes ASCII credentials", () => {
		expect(encodeBasicAuth({ username: "admin", password: "secret" })).toBe(
			"Basic YWRtaW46c2VjcmV0",
		);
	});

	it("encodes UTF-8 credentials", () => {
		expect(encodeBasicAuth({ username: "用户", password: "密码" })).toBe(
			"Basic 55So5oi3OuWvhueggQ==",
		);
	});
});
