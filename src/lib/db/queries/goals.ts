import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { activities, type Goal, goals, type NewGoal } from "../schema";

/** Summary stats computed per goal */
export interface GoalWithStats extends Goal {
	totalActivities: number;
	upcomingCount: number;
	inProgressCount: number;
	completedCount: number;
	firstDate: Date | null;
	lastDate: Date | null;
}

export async function getAllGoals(): Promise<GoalWithStats[]> {
	const rows = await db
		.select({
			id: goals.id,
			title: goals.title,
			description: goals.description,
			status: goals.status,
			tags: goals.tags,
			sortOrder: goals.sortOrder,
			createdAt: goals.createdAt,
			updatedAt: goals.updatedAt,
			totalActivities: sql<number>`count(${activities.id})::int`,
			upcomingCount: sql<number>`count(case when ${activities.status} = 'upcoming' then 1 end)::int`,
			inProgressCount: sql<number>`count(case when ${activities.status} = 'in_progress' then 1 end)::int`,
			completedCount: sql<number>`count(case when ${activities.status} = 'completed' then 1 end)::int`,
			firstDate: sql<Date | null>`min(${activities.fullDate})`,
			lastDate: sql<Date | null>`max(${activities.fullDate})`,
		})
		.from(goals)
		.leftJoin(activities, eq(goals.id, activities.goalId))
		.groupBy(goals.id)
		.orderBy(goals.sortOrder, goals.createdAt);

	return rows;
}

export async function getGoalById(id: string): Promise<Goal | undefined> {
	const [row] = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
	return row;
}

export async function getGoalWithActivities(id: string) {
	const result = await db.query.goals.findFirst({
		where: eq(goals.id, id),
		with: {
			activities: {
				with: { format: true },
				orderBy: (act, { desc }) => [desc(act.fullDate)],
			},
		},
	});
	return result;
}

export async function createGoal(data: NewGoal): Promise<Goal> {
	const [row] = await db.insert(goals).values(data).returning();
	return row;
}

export async function updateGoal(
	id: string,
	data: Partial<Omit<NewGoal, "id">>,
): Promise<Goal | undefined> {
	const [row] = await db.update(goals).set(data).where(eq(goals.id, id)).returning();
	return row;
}

export async function deleteGoal(id: string): Promise<boolean> {
	const result = await db.delete(goals).where(eq(goals.id, id)).returning({ id: goals.id });
	return result.length > 0;
}
