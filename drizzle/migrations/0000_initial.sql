CREATE TYPE "public"."activity_status" AS ENUM('upcoming', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('open', 'upcoming', 'completed');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"goal_id" text NOT NULL,
	"title" text NOT NULL,
	"full_date" date NOT NULL,
	"status" "activity_status" DEFAULT 'upcoming' NOT NULL,
	"format_id" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"notes" text,
	"references" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_formats" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"color" text DEFAULT '#6366f1' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_formats_name_unique" UNIQUE("name"),
	CONSTRAINT "activity_formats_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "goal_status" DEFAULT 'open' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_format_id_activity_formats_id_fk" FOREIGN KEY ("format_id") REFERENCES "public"."activity_formats"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_goal_id_idx" ON "activities" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "activities_format_id_idx" ON "activities" USING btree ("format_id");--> statement-breakpoint
CREATE INDEX "activities_status_idx" ON "activities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "activities_full_date_idx" ON "activities" USING btree ("full_date");
