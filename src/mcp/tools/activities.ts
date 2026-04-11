import type { McpServer } from "@modelcontextprotocol/server";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod/v4";
import {
	createActivity,
	deleteActivity,
	getActivityById,
	getAllActivities,
	updateActivity,
} from "@/lib/db/queries/activities";
import { error, success } from "../lib/responses";

export function registerActivityTools(server: McpServer) {
	server.registerTool(
		"list_activities",
		{
			title: "List Activities",
			description:
				"List activities with optional filters. Returns paginated results with goal and format info.",
			inputSchema: z.object({
				goalId: z.string().max(100).optional().describe("Filter by goal ID"),
				status: z
					.enum(["upcoming", "in_progress", "completed"])
					.optional()
					.describe("Filter by status"),
				formatId: z.string().max(100).optional().describe("Filter by format ID"),
				from: z.string().max(20).optional().describe("Start date (YYYY-MM-DD)"),
				to: z.string().max(20).optional().describe("End date (YYYY-MM-DD)"),
				page: z.number().int().min(1).default(1).describe("Page number"),
				limit: z.number().int().min(1).max(100).default(25).describe("Results per page"),
			}),
		},
		async ({ goalId, status, formatId, from, to, page, limit }) => {
			try {
				const filters = {
					...(goalId && { goalId }),
					...(status && { status }),
					...(formatId && { formatId }),
					...(from && { from: new Date(from) }),
					...(to && { to: new Date(to) }),
				};
				const result = await getAllActivities(filters, { page, limit });
				return success(result);
			} catch (err) {
				console.error("list_activities error:", err);
				return error("Failed to list activities");
			}
		},
	);

	server.registerTool(
		"get_activity",
		{
			title: "Get Activity",
			description: "Get a single activity by ID with its goal and format details.",
			inputSchema: z.object({
				id: z.string().min(1).max(100).describe("Activity ID"),
			}),
		},
		async ({ id }) => {
			try {
				const activity = await getActivityById(id);
				if (!activity) return error(`Activity not found: ${id}`);
				return success(activity);
			} catch (err) {
				console.error("get_activity error:", err);
				return error("Failed to get activity");
			}
		},
	);

	server.registerTool(
		"create_activity",
		{
			title: "Create Activity",
			description: "Create a new activity for a goal. Use list_formats to find valid format IDs.",
			inputSchema: z.object({
				goalId: z.string().min(1).max(100).describe("Goal ID this activity belongs to"),
				title: z.string().min(3).max(500).describe("Activity title"),
				fullDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
					.describe("Activity date (YYYY-MM-DD)"),
				formatId: z
					.string()
					.min(1)
					.max(100)
					.describe("Activity format ID (use list_formats to find)"),
				status: z
					.enum(["upcoming", "in_progress", "completed"])
					.default("upcoming")
					.describe("Activity status"),
				notes: z.string().max(10000).nullable().optional().describe("Activity notes (markdown)"),
				references: z.string().max(5000).nullable().optional().describe("References or links"),
				tags: z.array(z.string().max(50)).max(20).default([]).describe("Tags"),
			}),
		},
		async ({ goalId, title, fullDate, formatId, status, notes, references, tags }) => {
			try {
				const activity = await createActivity({
					id: createId(),
					goalId,
					title,
					fullDate: new Date(fullDate),
					formatId,
					status,
					notes: notes ?? null,
					references: references ?? null,
					tags,
				});
				return success(activity);
			} catch (err) {
				console.error("create_activity error:", err);
				return error("Failed to create activity");
			}
		},
	);

	server.registerTool(
		"update_activity",
		{
			title: "Update Activity",
			description: "Update fields on an existing activity. Only provided fields are changed.",
			inputSchema: z.object({
				id: z.string().min(1).max(100).describe("Activity ID to update"),
				title: z.string().min(3).max(500).optional().describe("New title"),
				fullDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
					.optional()
					.describe("New date (YYYY-MM-DD)"),
				status: z.enum(["upcoming", "in_progress", "completed"]).optional().describe("New status"),
				formatId: z.string().max(100).optional().describe("New format ID"),
				notes: z.string().max(10000).nullable().optional().describe("New notes (markdown)"),
				references: z.string().max(5000).nullable().optional().describe("New references"),
				tags: z.array(z.string().max(50)).max(20).optional().describe("Replace tags"),
			}),
		},
		async ({ id, fullDate, ...updates }) => {
			try {
				const clean: Record<string, unknown> = Object.fromEntries(
					Object.entries(updates).filter(([, v]) => v !== undefined),
				);
				if (fullDate) clean.fullDate = new Date(fullDate);
				if (Object.keys(clean).length === 0) return error("No fields to update");
				const activity = await updateActivity(id, clean);
				if (!activity) return error(`Activity not found: ${id}`);
				return success(activity);
			} catch (err) {
				console.error("update_activity error:", err);
				return error("Failed to update activity");
			}
		},
	);

	server.registerTool(
		"delete_activity",
		{
			title: "Delete Activity",
			description: "Delete an activity by ID.",
			inputSchema: z.object({
				id: z.string().min(1).max(100).describe("Activity ID to delete"),
			}),
		},
		async ({ id }) => {
			try {
				const deleted = await deleteActivity(id);
				if (!deleted) return error(`Activity not found: ${id}`);
				return success({ deleted: true });
			} catch (err) {
				console.error("delete_activity error:", err);
				return error("Failed to delete activity");
			}
		},
	);
}
