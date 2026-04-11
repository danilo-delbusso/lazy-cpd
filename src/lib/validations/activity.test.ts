import { describe, expect, it } from "vitest";
import { activitySchema, activityUpdateSchema } from "./activity";

describe("activitySchema", () => {
	it("accepts valid activity data", () => {
		const result = activitySchema.safeParse({
			title: "TypeScript Workshop",
			goalId: "goal_123",
			fullDate: "2026-04-03",
			status: "upcoming",
			formatId: "format_456",
			notes: "Some notes",
		});
		expect(result.success).toBe(true);
	});

	it("rejects missing goalId", () => {
		const result = activitySchema.safeParse({
			title: "Workshop",
			fullDate: "2026-04-03",
			formatId: "format_456",
		});
		expect(result.success).toBe(false);
	});

	it("rejects title shorter than 3 chars", () => {
		const result = activitySchema.safeParse({
			title: "ab",
			goalId: "goal_123",
			fullDate: "2026-04-03",
			formatId: "format_456",
		});
		expect(result.success).toBe(false);
	});

	it("coerces date strings", () => {
		const result = activitySchema.safeParse({
			title: "Workshop",
			goalId: "goal_123",
			fullDate: "2026-04-03",
			formatId: "format_456",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.fullDate).toBeInstanceOf(Date);
		}
	});

	it("allows null notes", () => {
		const result = activitySchema.safeParse({
			title: "Workshop",
			goalId: "goal_123",
			fullDate: "2026-04-03",
			formatId: "format_456",
			notes: null,
		});
		expect(result.success).toBe(true);
	});
});

describe("activityUpdateSchema", () => {
	it("accepts partial data", () => {
		const result = activityUpdateSchema.safeParse({ status: "completed" });
		expect(result.success).toBe(true);
	});
});
