vi.mock("server-only", () => ({}));

import { createId } from "@paralleldrive/cuid2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createActivity, deleteActivity } from "@/lib/db/queries/activities";
import { createFormat, deleteFormat } from "@/lib/db/queries/formats";
import {
	createGoal,
	deleteGoal,
	getAllGoals,
	getGoalWithActivities,
	updateGoal,
} from "@/lib/db/queries/goals";
import {
	getAllActivities,
	getActivityById,
	updateActivity,
} from "@/lib/db/queries/activities";
import { getAllFormats } from "@/lib/db/queries/formats";

/**
 * MCP tools are thin wrappers around the DB query functions.
 * This test verifies the query functions used by MCP tools work correctly
 * in the same patterns the tools use them (create with createId(), filter, etc.)
 */

const TEST_PREFIX = `test-mcp-${Date.now()}`;
const goalIds: string[] = [];
const formatIds: string[] = [];
const activityIds: string[] = [];

describe("MCP tool backing queries", () => {
	let goalId: string;
	let formatId: string;

	beforeAll(async () => {
		goalId = createId();
		formatId = createId();
		goalIds.push(goalId);
		formatIds.push(formatId);

		await createGoal({
			id: goalId,
			title: `${TEST_PREFIX} MCP Goal`,
			description: "A goal created in the MCP tool pattern",
			status: "open",
			tags: ["mcp", "test"],
		});
		await createFormat({
			id: formatId,
			name: `${TEST_PREFIX} MCP Format`,
			slug: `${TEST_PREFIX}_mcp_format`,
			color: "#ff00ff",
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

	describe("goal tools pattern", () => {
		it("list_goals: getAllGoals returns goals, filterable by status", async () => {
			const goals = await getAllGoals();
			expect(goals.length).toBeGreaterThan(0);

			const filtered = goals.filter((g) => g.status === "open");
			const testGoal = filtered.find((g) => g.id === goalId);
			expect(testGoal).toBeDefined();
		});

		it("get_goal: getGoalWithActivities returns goal with activities", async () => {
			const goal = await getGoalWithActivities(goalId);
			expect(goal).toBeDefined();
			expect(goal!.id).toBe(goalId);
			expect(goal!.activities).toBeDefined();
		});

		it("get_goal: returns undefined for non-existent id", async () => {
			const goal = await getGoalWithActivities("non-existent-mcp-goal");
			expect(goal).toBeUndefined();
		});

		it("create_goal: createGoal with createId pattern", async () => {
			const id = createId();
			goalIds.push(id);

			const goal = await createGoal({
				id,
				title: `${TEST_PREFIX} MCP Created`,
				description: "Created via MCP tool pattern",
				status: "upcoming",
				tags: ["created-via-mcp"],
			});

			expect(goal.id).toBe(id);
			expect(goal.status).toBe("upcoming");
		});

		it("update_goal: partial update with only provided fields", async () => {
			const updates = { title: `${TEST_PREFIX} MCP Updated Title` };
			const goal = await updateGoal(goalId, updates);

			expect(goal).toBeDefined();
			expect(goal!.title).toBe(updates.title);
			// Status should remain unchanged
			expect(goal!.status).toBe("open");
		});

		it("update_goal: returns undefined for non-existent id", async () => {
			const goal = await updateGoal("non-existent-mcp-goal", { title: "Nope" });
			expect(goal).toBeUndefined();
		});

		it("delete_goal: dry run pattern (no confirm)", async () => {
			const { getActivitiesByGoalId } = await import("@/lib/db/queries/activities");
			const activities = await getActivitiesByGoalId(goalId);
			// This is what the tool returns when confirm is false
			expect(typeof activities.length).toBe("number");
		});

		it("delete_goal: actual delete with confirm", async () => {
			const tempId = createId();
			await createGoal({
				id: tempId,
				title: `${TEST_PREFIX} MCP Delete Target`,
				description: "Will be deleted to test MCP delete_goal",
			});

			const deleted = await deleteGoal(tempId);
			expect(deleted).toBe(true);
		});
	});

	describe("activity tools pattern", () => {
		let activityId: string;

		it("create_activity: with createId and date string pattern", async () => {
			activityId = createId();
			activityIds.push(activityId);

			// MCP tool converts YYYY-MM-DD string to Date
			const activity = await createActivity({
				id: activityId,
				goalId,
				title: `${TEST_PREFIX} MCP Activity`,
				fullDate: new Date("2025-06-15"),
				formatId,
				status: "upcoming",
				notes: "MCP notes",
				references: null,
				tags: ["mcp"],
			});

			expect(activity.id).toBe(activityId);
			expect(activity.status).toBe("upcoming");
		});

		it("list_activities: with filters and pagination", async () => {
			const result = await getAllActivities(
				{ goalId, status: "upcoming" },
				{ page: 1, limit: 10 },
			);

			expect(result.data.length).toBeGreaterThan(0);
			for (const item of result.data) {
				expect(item.goalId).toBe(goalId);
				expect(item.status).toBe("upcoming");
			}
		});

		it("list_activities: with date range filter", async () => {
			const result = await getAllActivities(
				{ from: new Date("2025-01-01"), to: new Date("2025-12-31") },
				{ page: 1, limit: 100 },
			);

			expect(result.data.length).toBeGreaterThan(0);
		});

		it("get_activity: returns activity with joins", async () => {
			const activity = await getActivityById(activityId);

			expect(activity).toBeDefined();
			expect(activity!.goalTitle).toBe(`${TEST_PREFIX} MCP Updated Title`);
			expect(activity!.formatName).toBe(`${TEST_PREFIX} MCP Format`);
		});

		it("update_activity: partial update with date conversion", async () => {
			const updated = await updateActivity(activityId, {
				status: "completed",
				fullDate: new Date("2025-07-01"),
			});

			expect(updated).toBeDefined();
			expect(updated!.status).toBe("completed");
		});

		it("delete_activity: removes the activity", async () => {
			const tempId = createId();
			await createActivity({
				id: tempId,
				goalId,
				title: `${TEST_PREFIX} MCP Delete Activity`,
				fullDate: new Date("2025-08-01"),
				formatId,
				status: "upcoming",
				tags: [],
			});

			const deleted = await deleteActivity(tempId);
			expect(deleted).toBe(true);

			const result = await getActivityById(tempId);
			expect(result).toBeUndefined();
		});
	});

	describe("format tools pattern", () => {
		it("list_formats: returns formats with activity counts", async () => {
			const formats = await getAllFormats();
			expect(formats.length).toBeGreaterThan(0);

			const testFormat = formats.find((f) => f.id === formatId);
			expect(testFormat).toBeDefined();
			expect(typeof testFormat!.activityCount).toBe("number");
		});
	});

	describe("search tools pattern", () => {
		it("search: verifies data is searchable by querying goals and activities", async () => {
			// The search tool uses ilike queries. We verify the data exists for search.
			const goals = await getAllGoals();
			const testGoal = goals.find((g) => g.title.includes(TEST_PREFIX));
			expect(testGoal).toBeDefined();
		});
	});

	describe("stats tools pattern", () => {
		it("stats: getAllGoals provides data for goal status counts", async () => {
			const goals = await getAllGoals();
			const byStatus: Record<string, number> = { open: 0, upcoming: 0, completed: 0 };
			for (const g of goals) {
				byStatus[g.status] = (byStatus[g.status] || 0) + 1;
			}
			expect(byStatus.open + byStatus.upcoming + byStatus.completed).toBeGreaterThan(0);
		});
	});
});
