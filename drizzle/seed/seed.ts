import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { activities, activityFormats, goals } from "../../src/lib/db/schema";

const seedMode = process.env.SEED_MODE ?? "ci";
console.log(`Seeding database with mode: ${seedMode}`);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function seed() {
	const data =
		seedMode === "production" ? await import("./production-data") : await import("./ci-data");

	// Clear existing data in correct order (respect FK constraints)
	console.log("Clearing existing data...");
	await db.delete(activities);
	await db.delete(goals);
	await db.delete(activityFormats);

	// Seed formats
	if (data.formatSeeds.length > 0) {
		console.log(`Seeding ${data.formatSeeds.length} activity formats...`);
		await db.insert(activityFormats).values(data.formatSeeds);
	}

	// Seed goals
	if (data.goalSeeds.length > 0) {
		console.log(`Seeding ${data.goalSeeds.length} goals...`);
		await db.insert(goals).values(data.goalSeeds);
	}

	// Seed activities
	if (data.activitySeeds.length > 0) {
		console.log(`Seeding ${data.activitySeeds.length} activities...`);
		// Batch insert to avoid hitting parameter limits
		const batchSize = 100;
		for (let i = 0; i < data.activitySeeds.length; i += batchSize) {
			const batch = data.activitySeeds.slice(i, i + batchSize);
			await db.insert(activities).values(batch);
		}
	}

	console.log("Seeding complete.");
}

seed()
	.catch((err) => {
		console.error("Seed failed:", err);
		process.exit(1);
	})
	.finally(async () => {
		await client.end();
	});
