import { relations } from "drizzle-orm";
import {
	date,
	index,
	integer,
	pgEnum,
	pgSchema,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

// --- Schema ---
// When DB_SCHEMA is set (e.g. "cpd_portal"), tables live in a custom schema —
// useful for Supabase where you share a database with other apps.
// When unset, tables use the default public schema (vanilla Postgres).

const schemaName = process.env.DB_SCHEMA;

export const cpdSchema = schemaName ? pgSchema(schemaName) : null;

// biome-ignore lint/suspicious/noExplicitAny: pgSchema.table and pgTable have compatible signatures but differ in generic parameter
const defineTable: typeof pgTable = (cpdSchema ? cpdSchema.table.bind(cpdSchema) : pgTable) as any;
// biome-ignore lint/suspicious/noExplicitAny: pgSchema.enum and pgEnum have compatible signatures but differ in generic parameter
const defineEnum: typeof pgEnum = (cpdSchema ? cpdSchema.enum.bind(cpdSchema) : pgEnum) as any;

// --- Enums ---

export const goalStatusEnum = defineEnum("goal_status", ["open", "upcoming", "completed"]);

export const activityStatusEnum = defineEnum("activity_status", [
	"upcoming",
	"in_progress",
	"completed",
]);

// --- Tables ---

export const goals = defineTable("goals", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	status: goalStatusEnum("status").notNull().default("open"),
	tags: text("tags").array().notNull().default([]),
	sortOrder: integer("sort_order").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const activityFormats = defineTable("activity_formats", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	color: text("color").notNull().default("#6366f1"),
	sortOrder: integer("sort_order").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const activities = defineTable(
	"activities",
	{
		id: text("id").primaryKey(),
		goalId: text("goal_id")
			.notNull()
			.references(() => goals.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		fullDate: date("full_date", { mode: "date" }).notNull(),
		status: activityStatusEnum("status").notNull().default("upcoming"),
		formatId: text("format_id")
			.notNull()
			.references(() => activityFormats.id, { onDelete: "restrict" }),
		tags: text("tags").array().notNull().default([]),
		notes: text("notes"),
		references: text("references"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("activities_goal_id_idx").on(table.goalId),
		index("activities_format_id_idx").on(table.formatId),
		index("activities_status_idx").on(table.status),
		index("activities_full_date_idx").on(table.fullDate),
	],
);

// --- Relations ---

export const goalsRelations = relations(goals, ({ many }) => ({
	activities: many(activities),
}));

export const activityFormatsRelations = relations(activityFormats, ({ many }) => ({
	activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
	goal: one(goals, {
		fields: [activities.goalId],
		references: [goals.id],
	}),
	format: one(activityFormats, {
		fields: [activities.formatId],
		references: [activityFormats.id],
	}),
}));

// --- Inferred Types ---

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export type ActivityFormat = typeof activityFormats.$inferSelect;
export type NewActivityFormat = typeof activityFormats.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
