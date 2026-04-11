import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "..";
import { type Activity, activities, activityFormats, goals, type NewActivity } from "../schema";

export interface ActivityFilters {
	goalId?: string;
	status?: Activity["status"];
	formatId?: string;
	from?: Date;
	to?: Date;
}

export interface PaginationOptions {
	page: number;
	limit: number;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/** Shared projection for activity queries with joined goal/format data */
const activityWithJoins = {
	id: activities.id,
	goalId: activities.goalId,
	title: activities.title,
	fullDate: activities.fullDate,
	status: activities.status,
	formatId: activities.formatId,
	notes: activities.notes,
	references: activities.references,
	createdAt: activities.createdAt,
	updatedAt: activities.updatedAt,
	tags: activities.tags,
	goalTitle: goals.title,
	formatName: activityFormats.name,
	formatColor: activityFormats.color,
} as const;

/** Build WHERE conditions from filters */
function buildConditions(filters: ActivityFilters) {
	const conditions = [];
	if (filters.goalId) conditions.push(eq(activities.goalId, filters.goalId));
	if (filters.status) conditions.push(eq(activities.status, filters.status));
	if (filters.formatId) conditions.push(eq(activities.formatId, filters.formatId));
	if (filters.from) conditions.push(gte(activities.fullDate, filters.from));
	if (filters.to) conditions.push(lte(activities.fullDate, filters.to));
	return conditions.length > 0 ? and(...conditions) : undefined;
}

const DEFAULT_PAGINATION: PaginationOptions = { page: 1, limit: 25 };

export async function getAllActivities(
	filters: ActivityFilters = {},
	pagination: PaginationOptions = DEFAULT_PAGINATION,
): Promise<
	PaginatedResult<Activity & { goalTitle: string; formatName: string; formatColor: string }>
> {
	const where = buildConditions(filters);
	const offset = (pagination.page - 1) * pagination.limit;

	const [data, countResult] = await Promise.all([
		db
			.select(activityWithJoins)
			.from(activities)
			.innerJoin(goals, eq(activities.goalId, goals.id))
			.innerJoin(activityFormats, eq(activities.formatId, activityFormats.id))
			.where(where)
			.orderBy(desc(activities.fullDate))
			.limit(pagination.limit)
			.offset(offset),
		db.select({ count: sql<number>`count(*)::int` }).from(activities).where(where),
	]);

	const total = countResult[0]?.count ?? 0;

	return {
		data,
		total,
		page: pagination.page,
		limit: pagination.limit,
		totalPages: Math.ceil(total / pagination.limit),
	};
}

export async function getActivityById(
	id: string,
): Promise<
	(Activity & { goalTitle: string; formatName: string; formatColor: string }) | undefined
> {
	const [row] = await db
		.select(activityWithJoins)
		.from(activities)
		.innerJoin(goals, eq(activities.goalId, goals.id))
		.innerJoin(activityFormats, eq(activities.formatId, activityFormats.id))
		.where(eq(activities.id, id))
		.limit(1);
	return row;
}

export async function getActivitiesByGoalId(goalId: string): Promise<Activity[]> {
	return db
		.select()
		.from(activities)
		.where(eq(activities.goalId, goalId))
		.orderBy(desc(activities.fullDate));
}

export async function createActivity(data: NewActivity): Promise<Activity> {
	const [row] = await db.insert(activities).values(data).returning();
	return row;
}

export async function updateActivity(
	id: string,
	data: Partial<Omit<NewActivity, "id">>,
): Promise<Activity | undefined> {
	const [row] = await db.update(activities).set(data).where(eq(activities.id, id)).returning();
	return row;
}

export async function deleteActivity(id: string): Promise<boolean> {
	const result = await db
		.delete(activities)
		.where(eq(activities.id, id))
		.returning({ id: activities.id });
	return result.length > 0;
}
