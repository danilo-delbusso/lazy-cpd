vi.mock("server-only", () => ({}));

import { createId } from "@paralleldrive/cuid2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	createActivity,
	deleteActivity,
	getActivitiesByGoalId,
	getActivityById,
	getAllActivities,
	updateActivity,
} from "./activities";
import { createFormat, deleteFormat } from "./formats";
import { createGoal, deleteGoal } from "./goals";

const TEST_PREFIX = `test-act-${Date.now()}`;
const goalIds: string[] = [];
const formatIds: string[] = [];
const activityIds: string[] = [];

describe("activities queries", () => {
	let goalId: string;
	let formatId: string;
	let secondFormatId: string;

	beforeAll(async () => {
		goalId = createId();
		formatId = createId();
		secondFormatId = createId();
		goalIds.push(goalId);
		formatIds.push(formatId, secondFormatId);

		await createGoal({
			id: goalId,
			title: `${TEST_PREFIX} Goal`,
			description: "Goal for activity integration tests",
		});
		await createFormat({
			id: formatId,
			name: `${TEST_PREFIX} Workshop`,
			slug: `${TEST_PREFIX}_workshop`,
			color: "#111111",
		});
		await createFormat({
			id: secondFormatId,
			name: `${TEST_PREFIX} Course`,
			slug: `${TEST_PREFIX}_course`,
			color: "#222222",
		});
	});

	afterAll(async () => {
		for (const id of activityIds) {
			await deleteActivity(id).catch(() => {});
		}
		for (const id of goalIds) {
			await deleteGoal(id).catch(() => {});
		}
		for (const id of formatIds) {
			await deleteFormat(id).catch(() => {});
		}
	});

	it("createActivity inserts and returns an activity", async () => {
		const id = createId();
		activityIds.push(id);

		const activity = await createActivity({
			id,
			goalId,
			title: `${TEST_PREFIX} Activity A`,
			fullDate: new Date("2025-03-15"),
			status: "completed",
			formatId,
			tags: ["test"],
			notes: "Some notes",
			references: "https://example.com",
		});

		expect(activity.id).toBe(id);
		expect(activity.goalId).toBe(goalId);
		expect(activity.title).toBe(`${TEST_PREFIX} Activity A`);
		expect(activity.status).toBe("completed");
		expect(activity.notes).toBe("Some notes");
		expect(activity.references).toBe("https://example.com");
		expect(activity.tags).toEqual(["test"]);
	});

	it("createActivity with a second activity for pagination/filter tests", async () => {
		const id = createId();
		activityIds.push(id);

		const activity = await createActivity({
			id,
			goalId,
			title: `${TEST_PREFIX} Activity B`,
			fullDate: new Date("2025-06-20"),
			status: "upcoming",
			formatId: secondFormatId,
			tags: [],
		});

		expect(activity.status).toBe("upcoming");
	});

	it("getActivityById returns activity with joined goal/format", async () => {
		const activity = await getActivityById(activityIds[0]);

		expect(activity).toBeDefined();
		expect(activity?.id).toBe(activityIds[0]);
		expect(activity?.goalTitle).toBe(`${TEST_PREFIX} Goal`);
		expect(activity?.formatName).toBe(`${TEST_PREFIX} Workshop`);
		expect(activity?.formatColor).toBe("#111111");
	});

	it("getActivityById returns undefined for non-existent id", async () => {
		const result = await getActivityById("non-existent-activity-xyz");
		expect(result).toBeUndefined();
	});

	it("getActivitiesByGoalId returns activities for a goal", async () => {
		const results = await getActivitiesByGoalId(goalId);
		expect(results.length).toBeGreaterThanOrEqual(2);
		// Should be ordered by fullDate desc
		expect(results[0].fullDate >= results[1].fullDate).toBe(true);
	});

	it("getAllActivities returns paginated results", async () => {
		const result = await getAllActivities({}, { page: 1, limit: 1 });

		expect(result.data.length).toBeLessThanOrEqual(1);
		expect(result.limit).toBe(1);
		expect(result.page).toBe(1);
		expect(result.total).toBeGreaterThanOrEqual(2);
		expect(result.totalPages).toBeGreaterThanOrEqual(2);
	});

	it("getAllActivities filters by goalId", async () => {
		const result = await getAllActivities({ goalId }, { page: 1, limit: 100 });

		expect(result.data.length).toBeGreaterThanOrEqual(2);
		for (const item of result.data) {
			expect(item.goalId).toBe(goalId);
		}
	});

	it("getAllActivities filters by status", async () => {
		const result = await getAllActivities({ status: "completed" }, { page: 1, limit: 100 });

		for (const item of result.data) {
			expect(item.status).toBe("completed");
		}
	});

	it("getAllActivities filters by formatId", async () => {
		const result = await getAllActivities({ formatId: secondFormatId }, { page: 1, limit: 100 });

		for (const item of result.data) {
			expect(item.formatId).toBe(secondFormatId);
		}
	});

	it("getAllActivities filters by date range", async () => {
		const result = await getAllActivities(
			{ from: new Date("2025-05-01"), to: new Date("2025-07-01") },
			{ page: 1, limit: 100 },
		);

		for (const item of result.data) {
			const d = new Date(item.fullDate);
			expect(d.getTime()).toBeGreaterThanOrEqual(new Date("2025-05-01").getTime());
			expect(d.getTime()).toBeLessThanOrEqual(new Date("2025-07-01").getTime());
		}
	});

	it("updateActivity modifies fields", async () => {
		const updated = await updateActivity(activityIds[0], {
			title: `${TEST_PREFIX} Activity A Updated`,
			status: "in_progress",
			notes: "Updated notes",
		});

		expect(updated).toBeDefined();
		expect(updated?.title).toBe(`${TEST_PREFIX} Activity A Updated`);
		expect(updated?.status).toBe("in_progress");
		expect(updated?.notes).toBe("Updated notes");
	});

	it("updateActivity returns undefined for non-existent id", async () => {
		const result = await updateActivity("non-existent-activity-xyz", { title: "Nope" });
		expect(result).toBeUndefined();
	});

	it("deleteActivity removes the activity", async () => {
		const id = createId();
		await createActivity({
			id,
			goalId,
			title: `${TEST_PREFIX} Temp Activity`,
			fullDate: new Date("2025-09-01"),
			status: "upcoming",
			formatId,
			tags: [],
		});

		const deleted = await deleteActivity(id);
		expect(deleted).toBe(true);

		const result = await getActivityById(id);
		expect(result).toBeUndefined();
	});

	it("deleteActivity returns false for non-existent id", async () => {
		const result = await deleteActivity("non-existent-activity-xyz");
		expect(result).toBe(false);
	});
});
