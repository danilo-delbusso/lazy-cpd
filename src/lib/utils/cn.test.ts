import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
	it("joins multiple class strings", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("filters out falsy values", () => {
		expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
	});

	it("handles empty inputs", () => {
		expect(cn()).toBe("");
	});

	it("handles all falsy inputs", () => {
		expect(cn(false, null, undefined)).toBe("");
	});

	it("handles single class", () => {
		expect(cn("single")).toBe("single");
	});

	it("filters empty strings", () => {
		expect(cn("foo", "", "bar")).toBe("foo bar");
	});
});
