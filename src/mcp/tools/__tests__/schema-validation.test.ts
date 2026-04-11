import { describe, expect, it } from "vitest";
import { z } from "zod/v4";

/**
 * These tests validate the Zod schemas used by MCP tool registrations.
 * The schemas are defined inline in registerTool calls, so we recreate them
 * here to verify parsing behaviour, boundary conditions, and error cases.
 *
 * If a tool's inputSchema changes, update the corresponding schema here.
 */

// ---------- Goal tool schemas ----------

const listGoalsInput = z.object({
	status: z.enum(["open", "upcoming", "completed"]).optional(),
});

const getGoalInput = z.object({
	id: z.string().min(1).max(100),
});

const createGoalInput = z.object({
	title: z.string().min(3).max(500),
	description: z.string().min(10).max(5000),
	status: z.enum(["open", "upcoming", "completed"]).default("open"),
	tags: z.array(z.string().max(50)).max(20).default([]),
});

const updateGoalInput = z.object({
	id: z.string().min(1).max(100),
	title: z.string().min(3).max(500).optional(),
	description: z.string().min(10).max(5000).optional(),
	status: z.enum(["open", "upcoming", "completed"]).optional(),
	tags: z.array(z.string().max(50)).max(20).optional(),
});

const deleteGoalInput = z.object({
	id: z.string().min(1).max(100),
	confirm: z.boolean().default(false),
});

// ---------- Activity tool schemas ----------

const listActivitiesInput = z.object({
	goalId: z.string().max(100).optional(),
	status: z.enum(["upcoming", "in_progress", "completed"]).optional(),
	formatId: z.string().max(100).optional(),
	from: z.string().max(20).optional(),
	to: z.string().max(20).optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(25),
});

const createActivityInput = z.object({
	goalId: z.string().min(1).max(100),
	title: z.string().min(3).max(500),
	fullDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
	formatId: z.string().min(1).max(100),
	status: z.enum(["upcoming", "in_progress", "completed"]).default("upcoming"),
	notes: z.string().max(10000).nullable().optional(),
	references: z.string().max(5000).nullable().optional(),
	tags: z.array(z.string().max(50)).max(20).default([]),
});

const updateActivityInput = z.object({
	id: z.string().min(1).max(100),
	title: z.string().min(3).max(500).optional(),
	fullDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
		.optional(),
	status: z.enum(["upcoming", "in_progress", "completed"]).optional(),
	formatId: z.string().max(100).optional(),
	notes: z.string().max(10000).nullable().optional(),
	references: z.string().max(5000).nullable().optional(),
	tags: z.array(z.string().max(50)).max(20).optional(),
});

const deleteActivityInput = z.object({
	id: z.string().min(1).max(100),
});

// ---------- Search tool schema ----------

const searchInput = z.object({
	query: z.string().min(1).max(200),
	scope: z.enum(["all", "goals", "activities"]).default("all"),
});

// ============================================================
// Tests
// ============================================================

describe("Goal tool schemas", () => {
	describe("list_goals", () => {
		it("accepts empty object (no filter)", () => {
			expect(listGoalsInput.safeParse({}).success).toBe(true);
		});

		it("accepts valid status filter", () => {
			const result = listGoalsInput.safeParse({ status: "completed" });
			expect(result.success).toBe(true);
		});

		it("rejects invalid status", () => {
			expect(listGoalsInput.safeParse({ status: "archived" }).success).toBe(false);
		});
	});

	describe("get_goal", () => {
		it("accepts a valid id", () => {
			expect(getGoalInput.safeParse({ id: "clx123abc" }).success).toBe(true);
		});

		it("rejects empty id", () => {
			expect(getGoalInput.safeParse({ id: "" }).success).toBe(false);
		});

		it("rejects id exceeding max length", () => {
			expect(getGoalInput.safeParse({ id: "x".repeat(101) }).success).toBe(false);
		});

		it("rejects missing id", () => {
			expect(getGoalInput.safeParse({}).success).toBe(false);
		});
	});

	describe("create_goal", () => {
		const valid = {
			title: "Learn TypeScript",
			description: "Deep dive into advanced TypeScript patterns and type system.",
		};

		it("accepts valid input with defaults", () => {
			const result = createGoalInput.safeParse(valid);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.status).toBe("open");
				expect(result.data.tags).toEqual([]);
			}
		});

		it("accepts explicit status and tags", () => {
			const result = createGoalInput.safeParse({
				...valid,
				status: "upcoming",
				tags: ["ts", "learning"],
			});
			expect(result.success).toBe(true);
		});

		it("rejects title shorter than 3 chars", () => {
			expect(createGoalInput.safeParse({ ...valid, title: "ab" }).success).toBe(false);
		});

		it("rejects title exceeding 500 chars", () => {
			expect(createGoalInput.safeParse({ ...valid, title: "x".repeat(501) }).success).toBe(false);
		});

		it("rejects description shorter than 10 chars", () => {
			expect(createGoalInput.safeParse({ ...valid, description: "Short" }).success).toBe(false);
		});

		it("rejects description exceeding 5000 chars", () => {
			expect(createGoalInput.safeParse({ ...valid, description: "x".repeat(5001) }).success).toBe(
				false,
			);
		});

		it("rejects tags array exceeding 20 items", () => {
			const tags = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
			expect(createGoalInput.safeParse({ ...valid, tags }).success).toBe(false);
		});

		it("rejects individual tag exceeding 50 chars", () => {
			expect(createGoalInput.safeParse({ ...valid, tags: ["x".repeat(51)] }).success).toBe(false);
		});
	});

	describe("update_goal", () => {
		it("accepts partial updates", () => {
			expect(updateGoalInput.safeParse({ id: "abc", title: "New Title" }).success).toBe(true);
		});

		it("requires id", () => {
			expect(updateGoalInput.safeParse({ title: "New Title" }).success).toBe(false);
		});

		it("accepts id-only (no updates, handler decides)", () => {
			expect(updateGoalInput.safeParse({ id: "abc" }).success).toBe(true);
		});
	});

	describe("delete_goal", () => {
		it("defaults confirm to false", () => {
			const result = deleteGoalInput.safeParse({ id: "abc" });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.confirm).toBe(false);
			}
		});

		it("accepts confirm: true", () => {
			const result = deleteGoalInput.safeParse({ id: "abc", confirm: true });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.confirm).toBe(true);
			}
		});
	});
});

describe("Activity tool schemas", () => {
	describe("list_activities", () => {
		it("accepts empty object with defaults", () => {
			const result = listActivitiesInput.safeParse({});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(1);
				expect(result.data.limit).toBe(25);
			}
		});

		it("accepts all filters", () => {
			const result = listActivitiesInput.safeParse({
				goalId: "g1",
				status: "completed",
				formatId: "f1",
				from: "2025-01-01",
				to: "2025-12-31",
				page: 2,
				limit: 50,
			});
			expect(result.success).toBe(true);
		});

		it("rejects limit above 100", () => {
			expect(listActivitiesInput.safeParse({ limit: 101 }).success).toBe(false);
		});

		it("rejects page below 1", () => {
			expect(listActivitiesInput.safeParse({ page: 0 }).success).toBe(false);
		});

		it("rejects invalid activity status", () => {
			expect(listActivitiesInput.safeParse({ status: "open" }).success).toBe(false);
		});
	});

	describe("create_activity", () => {
		const valid = {
			goalId: "g1",
			title: "Attend workshop",
			fullDate: "2025-06-15",
			formatId: "f1",
		};

		it("accepts valid input with defaults", () => {
			const result = createActivityInput.safeParse(valid);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.status).toBe("upcoming");
				expect(result.data.tags).toEqual([]);
			}
		});

		it("accepts optional nullable fields", () => {
			const result = createActivityInput.safeParse({
				...valid,
				notes: "Some notes",
				references: "https://example.com",
			});
			expect(result.success).toBe(true);
		});

		it("accepts null for notes and references", () => {
			const result = createActivityInput.safeParse({
				...valid,
				notes: null,
				references: null,
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid date format (DD-MM-YYYY)", () => {
			expect(createActivityInput.safeParse({ ...valid, fullDate: "15-06-2025" }).success).toBe(
				false,
			);
		});

		it("rejects invalid date format (slash separator)", () => {
			expect(createActivityInput.safeParse({ ...valid, fullDate: "2025/06/15" }).success).toBe(
				false,
			);
		});

		it("rejects date with extra characters", () => {
			expect(
				createActivityInput.safeParse({ ...valid, fullDate: "2025-06-15T00:00" }).success,
			).toBe(false);
		});

		it("rejects empty fullDate", () => {
			expect(createActivityInput.safeParse({ ...valid, fullDate: "" }).success).toBe(false);
		});

		it("rejects notes exceeding 10000 chars", () => {
			expect(createActivityInput.safeParse({ ...valid, notes: "x".repeat(10001) }).success).toBe(
				false,
			);
		});

		it("rejects references exceeding 5000 chars", () => {
			expect(
				createActivityInput.safeParse({ ...valid, references: "x".repeat(5001) }).success,
			).toBe(false);
		});
	});

	describe("update_activity", () => {
		it("accepts partial updates", () => {
			const result = updateActivityInput.safeParse({ id: "a1", title: "Updated" });
			expect(result.success).toBe(true);
		});

		it("validates fullDate format when provided", () => {
			expect(updateActivityInput.safeParse({ id: "a1", fullDate: "not-a-date" }).success).toBe(
				false,
			);
		});

		it("accepts valid fullDate", () => {
			expect(updateActivityInput.safeParse({ id: "a1", fullDate: "2025-12-25" }).success).toBe(
				true,
			);
		});
	});

	describe("delete_activity", () => {
		it("requires id", () => {
			expect(deleteActivityInput.safeParse({}).success).toBe(false);
		});

		it("accepts valid id", () => {
			expect(deleteActivityInput.safeParse({ id: "a1" }).success).toBe(true);
		});
	});
});

describe("Search tool schema", () => {
	it("accepts valid query with default scope", () => {
		const result = searchInput.safeParse({ query: "typescript" });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.scope).toBe("all");
		}
	});

	it("accepts explicit scope", () => {
		expect(searchInput.safeParse({ query: "test", scope: "goals" }).success).toBe(true);
	});

	it("rejects empty query", () => {
		expect(searchInput.safeParse({ query: "" }).success).toBe(false);
	});

	it("rejects query exceeding 200 chars", () => {
		expect(searchInput.safeParse({ query: "x".repeat(201) }).success).toBe(false);
	});

	it("rejects invalid scope", () => {
		expect(searchInput.safeParse({ query: "test", scope: "formats" }).success).toBe(false);
	});
});
