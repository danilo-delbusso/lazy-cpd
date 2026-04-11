vi.mock("server-only", () => ({}));

import { createId } from "@paralleldrive/cuid2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	createGoal,
	deleteGoal,
	getAllGoals,
	getGoalById,
	getGoalWithActivities,
	updateGoal,
} from "./goals";
import { createActivity, deleteActivity } from "./activities";
import { createFormat, deleteFormat } from "./formats";

const TEST_PREFIX = `test-goal-${Date.now()}`;
const goalIds: string[] = [];
const formatIds: string[] = [];
const activityIds: string[] = [];

describe("goals queries", () => {
	let formatId: string;

	beforeAll(async () => {
		// Create a format for activity tests
		formatId = createId();
		formatIds.push(formatId);
		await createFormat({
			id: formatId,
			name: `${TEST_PREFIX}-fmt`,
			slug: `${TEST_PREFIX}_fmt`,
			color: "#123456",
		});
	});

	afterAll(async () => {
		// Clean up in reverse dependency order
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

	it("createGoal inserts a goal and returns it", async () => {
		const id = createId();
		goalIds.push(id);

		const goal = await createGoal({
			id,
			title: `${TEST_PREFIX} Goal A`,
			description: "A test goal for integration testing",
			status: "open",
			tags: ["test", "integration"],
		});

		expect(goal.id).toBe(id);
		expect(goal.title).toBe(`${TEST_PREFIX} Goal A`);
		expect(goal.status).toBe("open");
		expect(goal.tags).toEqual(["test", "integration"]);
		expect(goal.createdAt).toBeInstanceOf(Date);
	});

	it("getGoalById returns the created goal", async () => {
		const id = goalIds[0];
		const goal = await getGoalById(id);

		expect(goal).toBeDefined();
		expect(goal!.id).toBe(id);
		expect(goal!.title).toBe(`${TEST_PREFIX} Goal A`);
	});

	it("getGoalById returns undefined for non-existent id", async () => {
		const goal = await getGoalById("non-existent-id-xyz");
		expect(goal).toBeUndefined();
	});

	it("getAllGoals returns goals with stats", async () => {
		const goals = await getAllGoals();
		const testGoal = goals.find((g) => g.id === goalIds[0]);

		expect(testGoal).toBeDefined();
		expect(testGoal!.totalActivities).toBe(0);
		expect(testGoal!.upcomingCount).toBe(0);
		expect(testGoal!.completedCount).toBe(0);
		expect(testGoal!.firstDate).toBeNull();
		expect(testGoal!.lastDate).toBeNull();
	});

	it("getAllGoals includes activity stats after adding activities", async () => {
		const actId = createId();
		activityIds.push(actId);

		await createActivity({
			id: actId,
			goalId: goalIds[0],
			title: `${TEST_PREFIX} Activity`,
			fullDate: new Date("2025-06-15"),
			status: "completed",
			formatId,
			tags: [],
		});

		const goals = await getAllGoals();
		const testGoal = goals.find((g) => g.id === goalIds[0]);

		expect(testGoal).toBeDefined();
		expect(testGoal!.totalActivities).toBe(1);
		expect(testGoal!.completedCount).toBe(1);
	});

	it("getGoalWithActivities returns goal with nested activities and format", async () => {
		const result = await getGoalWithActivities(goalIds[0]);

		expect(result).toBeDefined();
		expect(result!.id).toBe(goalIds[0]);
		expect(result!.activities).toHaveLength(1);
		expect(result!.activities[0].format).toBeDefined();
		expect(result!.activities[0].format.id).toBe(formatId);
	});

	it("getGoalWithActivities returns undefined for non-existent id", async () => {
		const result = await getGoalWithActivities("non-existent-id-xyz");
		expect(result).toBeUndefined();
	});

	it("updateGoal modifies fields and returns updated row", async () => {
		const id = goalIds[0];
		const updated = await updateGoal(id, {
			title: `${TEST_PREFIX} Goal A Updated`,
			status: "completed",
		});

		expect(updated).toBeDefined();
		expect(updated!.title).toBe(`${TEST_PREFIX} Goal A Updated`);
		expect(updated!.status).toBe("completed");
	});

	it("updateGoal returns undefined for non-existent id", async () => {
		const result = await updateGoal("non-existent-id-xyz", { title: "Nope" });
		expect(result).toBeUndefined();
	});

	it("deleteGoal cascades and removes activities", async () => {
		// Create a goal with an activity, then delete it
		const gId = createId();
		const aId = createId();

		await createGoal({
			id: gId,
			title: `${TEST_PREFIX} Cascade Goal`,
			description: "Will be deleted to test cascade",
		});
		await createActivity({
			id: aId,
			goalId: gId,
			title: `${TEST_PREFIX} Cascade Activity`,
			fullDate: new Date("2025-07-01"),
			status: "upcoming",
			formatId,
			tags: [],
		});

		const deleted = await deleteGoal(gId);
		expect(deleted).toBe(true);

		// Activity should be gone due to cascade
		const { getActivityById } = await import("./activities");
		const activity = await getActivityById(aId);
		expect(activity).toBeUndefined();
	});

	it("deleteGoal returns false for non-existent id", async () => {
		const result = await deleteGoal("non-existent-id-xyz");
		expect(result).toBe(false);
	});
});
