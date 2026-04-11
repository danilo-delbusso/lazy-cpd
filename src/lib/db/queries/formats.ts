import { eq, sql } from "drizzle-orm";
import { db } from "..";
import {
	type ActivityFormat,
	activities,
	activityFormats,
	type NewActivityFormat,
} from "../schema";

export interface FormatWithCount extends ActivityFormat {
	activityCount: number;
}

export async function getAllFormats(): Promise<FormatWithCount[]> {
	return db
		.select({
			id: activityFormats.id,
			name: activityFormats.name,
			slug: activityFormats.slug,
			color: activityFormats.color,
			sortOrder: activityFormats.sortOrder,
			createdAt: activityFormats.createdAt,
			updatedAt: activityFormats.updatedAt,
			activityCount: sql<number>`count(${activities.id})::int`,
		})
		.from(activityFormats)
		.leftJoin(activities, eq(activityFormats.id, activities.formatId))
		.groupBy(activityFormats.id)
		.orderBy(activityFormats.sortOrder, activityFormats.name);
}

export async function getFormatById(id: string): Promise<ActivityFormat | undefined> {
	const [row] = await db.select().from(activityFormats).where(eq(activityFormats.id, id)).limit(1);
	return row;
}

export async function getFormatActivityCount(id: string): Promise<number> {
	const [result] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(activities)
		.where(eq(activities.formatId, id));
	return result?.count ?? 0;
}

export async function createFormat(data: NewActivityFormat): Promise<ActivityFormat> {
	const [row] = await db.insert(activityFormats).values(data).returning();
	return row;
}

export async function updateFormat(
	id: string,
	data: Partial<Omit<NewActivityFormat, "id">>,
): Promise<ActivityFormat | undefined> {
	const [row] = await db
		.update(activityFormats)
		.set(data)
		.where(eq(activityFormats.id, id))
		.returning();
	return row;
}

export async function deleteFormat(id: string): Promise<boolean> {
	const count = await getFormatActivityCount(id);
	if (count > 0) {
		throw new Error(`Cannot delete format: ${count} activities reference it. Reassign them first.`);
	}
	const result = await db
		.delete(activityFormats)
		.where(eq(activityFormats.id, id))
		.returning({ id: activityFormats.id });
	return result.length > 0;
}
