import { z } from "zod/v4";

const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

export const formatSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(100),
	slug: z
		.string()
		.max(100)
		.regex(/^[a-z0-9_]+$/, "Slug must be lowercase alphanumeric with underscores")
		.optional(),
	color: z.string().regex(hexColorRegex, "Must be a valid hex color (e.g. #ff0000)"),
	sortOrder: z.number().int().min(0).optional(),
});

export const formatUpdateSchema = formatSchema.partial();

/** Generate a slug from a display name */
export function slugify(name: string): string {
	return name
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, "_")
		.replaceAll(/^_|_$/g, "");
}

export type FormatInput = z.infer<typeof formatSchema>;
export type FormatUpdateInput = z.infer<typeof formatUpdateSchema>;
