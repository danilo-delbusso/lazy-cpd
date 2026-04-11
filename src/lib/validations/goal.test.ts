import { describe, expect, it } from "vitest";
import { goalSchema, goalUpdateSchema } from "./goal";

describe("goalSchema", () => {
	it("accepts valid goal data", () => {
		const result = goalSchema.safeParse({
			title: "Learn TypeScript",
			description: "Deep dive into advanced TypeScript patterns and type system.",
			status: "open",
		});
		expect(result.success).toBe(true);
	});

	it("rejects title shorter than 3 chars", () => {
		const result = goalSchema.safeParse({
			title: "ab",
			description: "A valid description here.",
			status: "open",
		});
		expect(result.success).toBe(false);
	});

	it("rejects description shorter than 10 chars", () => {
		const result = goalSchema.safeParse({
			title: "Valid Title",
			description: "Short",
			status: "open",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid status", () => {
		const result = goalSchema.safeParse({
			title: "Valid Title",
			description: "A valid description here.",
			status: "invalid",
		});
		expect(result.success).toBe(false);
	});

	it("defaults status to open", () => {
		const result = goalSchema.safeParse({
			title: "Valid Title",
			description: "A valid description here.",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("open");
		}
	});
});

describe("goalUpdateSchema", () => {
	it("accepts partial data", () => {
		const result = goalUpdateSchema.safeParse({ title: "New Title" });
		expect(result.success).toBe(true);
	});

	it("accepts empty object", () => {
		const result = goalUpdateSchema.safeParse({});
		expect(result.success).toBe(true);
	});
});
