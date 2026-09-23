import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { currentMonthKey, matchesTimelineFilters } from "./timeline-view";

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

function activity(status: string, formatId: string) {
	return { status, formatId } as Parameters<typeof matchesTimelineFilters>[0];
}

describe("matchesTimelineFilters", () => {
	it("matches everything when both filters are empty", () => {
		expect(matchesTimelineFilters(activity("completed", "fmt1"), [], [])).toBe(true);
	});

	it("matches only the selected statuses", () => {
		const a = activity("completed", "fmt1");
		expect(matchesTimelineFilters(a, ["completed"], [])).toBe(true);
		expect(matchesTimelineFilters(a, ["upcoming"], [])).toBe(false);
		expect(matchesTimelineFilters(a, ["upcoming", "completed"], [])).toBe(true);
	});

	it("matches only the selected types", () => {
		const a = activity("completed", "fmt1");
		expect(matchesTimelineFilters(a, [], ["fmt1"])).toBe(true);
		expect(matchesTimelineFilters(a, [], ["fmt2"])).toBe(false);
	});

	it("requires both filters to pass when both are set", () => {
		const a = activity("completed", "fmt1");
		expect(matchesTimelineFilters(a, ["completed"], ["fmt1"])).toBe(true);
		expect(matchesTimelineFilters(a, ["completed"], ["fmt2"])).toBe(false);
		expect(matchesTimelineFilters(a, ["upcoming"], ["fmt1"])).toBe(false);
	});
});
