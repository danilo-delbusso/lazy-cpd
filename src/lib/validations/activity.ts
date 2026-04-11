import { z } from "zod/v4";

export const activityStatusValues = ["upcoming", "in_progress", "completed"] as const;
export type ActivityStatusValue = (typeof activityStatusValues)[number];

export const activitySchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters").max(500),
	goalId: z.string().min(1, "Goal is required").max(100),
	fullDate: z.coerce.date({ error: "Valid date is required" }),
	status: z.enum(activityStatusValues).default("upcoming"),
	formatId: z.string().min(1, "Format is required").max(100),
	tags: z.array(z.string().max(50)).max(20).default([]),
	notes: z.string().max(10000).nullable().optional(),
	references: z.string().max(5000).nullable().optional(),
});

export const activityUpdateSchema = activitySchema.partial();

export type ActivityInput = z.infer<typeof activitySchema>;
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>;
