import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is required");
}

// Connection pool for queries (max 10 connections for serverless-friendly usage)
const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
