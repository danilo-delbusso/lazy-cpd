import { describe, expect, it } from "vitest";
import {
	activityStatusColors,
	activityStatusLabels,
	goalStatusColors,
	goalStatusLabels,
} from "./format-labels";

describe("goalStatusLabels", () => {
	it("has labels for all statuses", () => {
		expect(goalStatusLabels.open).toBe("Open");
		expect(goalStatusLabels.upcoming).toBe("Upcoming");
		expect(goalStatusLabels.completed).toBe("Completed");
	});
});

describe("goalStatusColors", () => {
	it("has color classes for all statuses", () => {
		expect(goalStatusColors.open).toContain("bg-");
		expect(goalStatusColors.upcoming).toContain("bg-");
		expect(goalStatusColors.completed).toContain("bg-");
	});
});

describe("activityStatusLabels", () => {
	it("has labels for all statuses", () => {
		expect(activityStatusLabels.upcoming).toBe("Upcoming");
		expect(activityStatusLabels.in_progress).toBe("In Progress");
		expect(activityStatusLabels.completed).toBe("Completed");
	});
});

describe("activityStatusColors", () => {
	it("has color classes for all statuses", () => {
		expect(activityStatusColors.upcoming).toContain("bg-");
		expect(activityStatusColors.in_progress).toContain("bg-");
		expect(activityStatusColors.completed).toContain("bg-");
	});
});
