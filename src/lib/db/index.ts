import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL environment variable is required");
	}
	const client = postgres(connectionString, { max: 10 });
	return drizzle(client, { schema });
}

// Lazy singleton — connection is created on first use, not at import time.
// This prevents build failures when DATABASE_URL isn't set (e.g. Docker build step).
let _db: ReturnType<typeof createDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof createDb>, {
	get(_target, prop) {
		if (!_db) _db = createDb();
		return Reflect.get(_db, prop);
	},
});
