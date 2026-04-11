import { describe, expect, it } from "vitest";
import { serializeDates } from "./serialize";

describe("serializeDates", () => {
	it("converts Date to ISO string", () => {
		const d = new Date("2024-06-15T10:30:00.000Z");
		expect(serializeDates(d)).toBe("2024-06-15T10:30:00.000Z");
	});

	it("recursively converts nested Dates", () => {
		const input = {
			title: "Test",
			createdAt: new Date("2024-01-01"),
			nested: { updatedAt: new Date("2024-06-15") },
		};
		const result = serializeDates(input);
		expect(typeof result.createdAt).toBe("string");
		expect(typeof result.nested.updatedAt).toBe("string");
		expect(result.title).toBe("Test");
	});

	it("handles arrays with Dates", () => {
		const input = [{ date: new Date("2024-06-15"), name: "test" }];
		const result = serializeDates(input);
		expect(typeof result[0].date).toBe("string");
		expect(result[0].name).toBe("test");
	});

	it("passes through primitives", () => {
		expect(serializeDates("hello")).toBe("hello");
		expect(serializeDates(42)).toBe(42);
		expect(serializeDates(true)).toBe(true);
		expect(serializeDates(null)).toBeNull();
		expect(serializeDates(undefined)).toBeUndefined();
	});
});
