import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL environment variable is required");
}

const schemaName = process.env.DB_SCHEMA;

export default defineConfig({
	schema: "./src/lib/db/schema.ts",
	out: "./drizzle/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl,
	},
	// When using a custom schema, restrict drizzle-kit to only manage that schema.
	// Without this, drizzle-kit would also introspect/manage other schemas (e.g. Supabase internals).
	...(schemaName ? { schemaFilter: [schemaName] } : {}),
});
