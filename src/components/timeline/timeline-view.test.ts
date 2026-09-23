import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { currentMonthKey } from "./timeline-view";

describe("currentMonthKey", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns a year and month key for the current date", () => {
		vi.setSystemTime(new Date(2026, 7, 25));
		expect(currentMonthKey()).toBe("2026-08");
	});

	it("pads a single digit month", () => {
		vi.setSystemTime(new Date(2026, 0, 1));
		expect(currentMonthKey()).toBe("2026-01");
	});
});
