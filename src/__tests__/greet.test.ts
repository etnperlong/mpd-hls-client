import { describe, expect, test } from "bun:test";
import { greet } from "../greet";

describe("greet", () => {
	test("returns greeting with name", () => {
		expect(greet("Alice")).toBe("Hello, Alice!");
	});

	test("returns greeting with empty string", () => {
		expect(greet("")).toBe("Hello, !");
	});
});
