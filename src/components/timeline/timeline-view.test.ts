import { describe, expect, it } from "vitest";
import { matchesTimelineFilters } from "./timeline-view";

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
