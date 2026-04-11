import type { McpServer } from "@modelcontextprotocol/server";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { activities, activityFormats, goals } from "@/lib/db/schema";
import { error, success } from "../lib/responses";

export function registerStatsTools(server: McpServer) {
	server.registerTool(
		"get_stats",
		{
			title: "Get Stats",
			description:
				"Return aggregate dashboard statistics: goal counts by status, activity counts by status, unique formats used, activity date range, and the 5 most recent activities.",
			inputSchema: z.object({}),
		},
		async () => {
			try {
				const [goalStats, activityStats, formatCount, dateRange, recentActivities] =
					await Promise.all([
						// Goal counts by status
						db
							.select({
								status: goals.status,
								count: sql<number>`count(*)::int`,
							})
							.from(goals)
							.groupBy(goals.status),

						// Activity counts by status
						db
							.select({
								status: activities.status,
								count: sql<number>`count(*)::int`,
							})
							.from(activities)
							.groupBy(activities.status),

						// Unique formats in use (formats actually referenced by activities)
						db
							.select({ count: sql<number>`count(distinct ${activities.formatId})::int` })
							.from(activities),

						// Date range of activities
						db
							.select({
								earliest: sql<string | null>`min(${activities.fullDate})::text`,
								latest: sql<string | null>`max(${activities.fullDate})::text`,
							})
							.from(activities),

						// 5 most recent activities with format name
						db
							.select({
								title: activities.title,
								date: activities.fullDate,
								formatName: activityFormats.name,
							})
							.from(activities)
							.innerJoin(activityFormats, eq(activities.formatId, activityFormats.id))
							.orderBy(desc(activities.fullDate))
							.limit(5),
					]);

				// Reshape goal counts into a keyed object
				const goalsByStatus: Record<string, number> = { open: 0, upcoming: 0, completed: 0 };
				let totalGoals = 0;
				for (const row of goalStats) {
					goalsByStatus[row.status] = row.count;
					totalGoals += row.count;
				}

				// Reshape activity counts into a keyed object
				const activitiesByStatus: Record<string, number> = {
					upcoming: 0,
					in_progress: 0,
					completed: 0,
				};
				let totalActivities = 0;
				for (const row of activityStats) {
					activitiesByStatus[row.status] = row.count;
					totalActivities += row.count;
				}

				return success({
					goals: { total: totalGoals, ...goalsByStatus },
					activities: { total: totalActivities, ...activitiesByStatus },
					uniqueFormatsUsed: formatCount[0]?.count ?? 0,
					dateRange: {
						earliest: dateRange[0]?.earliest ?? null,
						latest: dateRange[0]?.latest ?? null,
					},
					recentActivities: recentActivities.map((a) => ({
						title: a.title,
						date: a.date,
						formatName: a.formatName,
					})),
				});
			} catch (err) {
				console.error("get_stats error:", err);
				return error("Failed to retrieve dashboard stats");
			}
		},
	);
}
