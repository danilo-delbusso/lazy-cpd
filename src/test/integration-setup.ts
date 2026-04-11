import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL required for integration tests");

const client = postgres(connectionString, { max: 1 });
export const testDb = drizzle(client, { schema });

/** Clean up test data — call in afterEach/afterAll */
export async function cleanTestData(ids: {
	goalIds?: string[];
	formatIds?: string[];
	activityIds?: string[];
}) {
	if (ids.activityIds?.length) {
		await testDb.delete(schema.activities).where(
			// biome-ignore lint/suspicious/noExplicitAny: test utility
			(schema.activities.id as any).in(ids.activityIds),
		);
	}
	if (ids.goalIds?.length) {
		await testDb.delete(schema.goals).where(
			// biome-ignore lint/suspicious/noExplicitAny: test utility
			(schema.goals.id as any).in(ids.goalIds),
		);
	}
	if (ids.formatIds?.length) {
		await testDb.delete(schema.activityFormats).where(
			// biome-ignore lint/suspicious/noExplicitAny: test utility
			(schema.activityFormats.id as any).in(ids.formatIds),
		);
	}
}

export async function closeTestDb() {
	await client.end();
}
