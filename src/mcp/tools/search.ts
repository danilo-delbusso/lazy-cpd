import type { McpServer } from "@modelcontextprotocol/server";
import { ilike, or, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { activities, activityFormats, goals } from "@/lib/db/schema";
import { error, success } from "../lib/responses";

export function registerSearchTools(server: McpServer) {
	server.registerTool(
		"search",
		{
			title: "Search CPD Data",
			description:
				"Search across goals and activities by text. Searches titles, descriptions, notes, and references.",
			inputSchema: z.object({
				query: z.string().min(1).max(200).describe("Search text"),
				scope: z.enum(["all", "goals", "activities"]).default("all").describe("Scope of search"),
			}),
		},
		async ({ query, scope }) => {
			try {
				const escaped = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
				const pattern = `%${escaped}%`;
				const results: { goals?: unknown[]; activities?: unknown[] } = {};

				if (scope === "all" || scope === "goals") {
					results.goals = await db
						.select({
							id: goals.id,
							title: goals.title,
							description: goals.description,
							status: goals.status,
							tags: goals.tags,
						})
						.from(goals)
						.where(or(ilike(goals.title, pattern), ilike(goals.description, pattern)))
						.limit(20);
				}

				if (scope === "all" || scope === "activities") {
					results.activities = await db
						.select({
							id: activities.id,
							title: activities.title,
							goalId: activities.goalId,
							goalTitle: goals.title,
							formatName: activityFormats.name,
							fullDate: activities.fullDate,
							status: activities.status,
							tags: activities.tags,
							notes: sql<string>`left(${activities.notes}, 200)`,
						})
						.from(activities)
						.innerJoin(goals, sql`${activities.goalId} = ${goals.id}`)
						.innerJoin(activityFormats, sql`${activities.formatId} = ${activityFormats.id}`)
						.where(
							or(
								ilike(activities.title, pattern),
								ilike(activities.notes, pattern),
								ilike(activities.references, pattern),
							),
						)
						.limit(20);
				}

				return success(results);
			} catch (err) {
				console.error("search error:", err);
				return error("Search failed");
			}
		},
	);
}
