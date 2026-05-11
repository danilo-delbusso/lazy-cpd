import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { activities, activityFormats, goals } from "../../src/lib/db/schema";
import { formatSeeds } from "./data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function seed() {
	console.log("Clearing existing data...");
	await db.delete(activities);
	await db.delete(goals);
	await db.delete(activityFormats);

	console.log(`Seeding ${formatSeeds.length} activity formats...`);
	await db.insert(activityFormats).values(formatSeeds);

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
