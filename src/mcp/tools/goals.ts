import type { McpServer } from "@modelcontextprotocol/server";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod/v4";
import { getActivitiesByGoalId } from "@/lib/db/queries/activities";
import {
	createGoal,
	deleteGoal,
	getAllGoals,
	getGoalWithActivities,
	updateGoal,
} from "@/lib/db/queries/goals";
import { error, success } from "../lib/responses";

export function registerGoalTools(server: McpServer) {
	server.registerTool(
		"list_goals",
		{
			title: "List Goals",
			description: "List all CPD goals with activity counts. Optionally filter by status.",
			inputSchema: z.object({
				status: z
					.enum(["open", "upcoming", "completed"])
					.optional()
					.describe("Filter by goal status"),
			}),
		},
		async ({ status }) => {
			try {
				const goals = await getAllGoals();
				const filtered = status ? goals.filter((g) => g.status === status) : goals;
				return success(filtered);
			} catch (err) {
				console.error("list_goals error:", err);
				return error("Failed to list goals");
			}
		},
	);

	server.registerTool(
		"get_goal",
		{
			title: "Get Goal",
			description: "Get a single goal by ID, including all its activities with format details.",
			inputSchema: z.object({
				id: z.string().min(1).max(100).describe("Goal ID"),
			}),
		},
		async ({ id }) => {
			try {
				const goal = await getGoalWithActivities(id);
				if (!goal) return error(`Goal not found: ${id}`);
				return success(goal);
			} catch (err) {
				console.error("get_goal error:", err);
				return error("Failed to get goal");
			}
		},
	);

	server.registerTool(
		"create_goal",
		{
			title: "Create Goal",
			description: "Create a new CPD goal.",
			inputSchema: z.object({
				title: z.string().min(3).max(500).describe("Goal title"),
				description: z.string().min(10).max(5000).describe("Goal description"),
				status: z.enum(["open", "upcoming", "completed"]).default("open").describe("Goal status"),
				tags: z.array(z.string().max(50)).max(20).default([]).describe("Tags for categorisation"),
			}),
		},
		async ({ title, description, status, tags }) => {
			try {
				const goal = await createGoal({ id: createId(), title, description, status, tags });
				return success(goal);
			} catch (err) {
				console.error("create_goal error:", err);
				return error("Failed to create goal");
			}
		},
	);

	server.registerTool(
		"update_goal",
		{
			title: "Update Goal",
			description: "Update fields on an existing goal. Only provided fields are changed.",
			inputSchema: z.object({
				id: z.string().min(1).max(100).describe("Goal ID to update"),
				title: z.string().min(3).max(500).optional().describe("New title"),
				description: z.string().min(10).max(5000).optional().describe("New description"),
				status: z.enum(["open", "upcoming", "completed"]).optional().describe("New status"),
				tags: z.array(z.string().max(50)).max(20).optional().describe("Replace tags"),
			}),
		},
		async ({ id, ...updates }) => {
			try {
				const clean = Object.fromEntries(
					Object.entries(updates).filter(([, v]) => v !== undefined),
				);
				if (Object.keys(clean).length === 0) return error("No fields to update");
				const goal = await updateGoal(id, clean);
				if (!goal) return error(`Goal not found: ${id}`);
				return success(goal);
			} catch (err) {
				console.error("update_goal error:", err);
				return error("Failed to update goal");
			}
		},
	);

	server.registerTool(
		"delete_goal",
		{
			title: "Delete Goal",
			description:
				"Delete a goal and ALL its activities (cascade). Pass confirm: true to execute. Without confirm, returns the count of activities that would be deleted.",
			inputSchema: z.object({
				id: z.string().min(1).max(100).describe("Goal ID to delete"),
				confirm: z.boolean().default(false).describe("Must be true to actually delete"),
			}),
		},
		async ({ id, confirm }) => {
			try {
				const activities = await getActivitiesByGoalId(id);
				if (!confirm) {
					return success({
						warning: `This will delete the goal and ${activities.length} activities. Pass confirm: true to proceed.`,
						activityCount: activities.length,
					});
				}
				const deleted = await deleteGoal(id);
				if (!deleted) return error(`Goal not found: ${id}`);
				return success({ deleted: true, activitiesRemoved: activities.length });
			} catch (err) {
				console.error("delete_goal error:", err);
				return error("Failed to delete goal");
			}
		},
	);
}
