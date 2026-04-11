import { z } from "zod/v4";

export const goalStatusValues = ["open", "upcoming", "completed"] as const;
export type GoalStatus = (typeof goalStatusValues)[number];

export const goalSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters").max(500),
	description: z.string().min(10, "Description must be at least 10 characters").max(5000),
	status: z.enum(goalStatusValues).default("open"),
	tags: z.array(z.string().max(50)).max(20).default([]),
	sortOrder: z.number().int().min(0).optional(),
});

export const goalUpdateSchema = goalSchema.partial();

export type GoalInput = z.infer<typeof goalSchema>;
export type GoalUpdateInput = z.infer<typeof goalUpdateSchema>;
