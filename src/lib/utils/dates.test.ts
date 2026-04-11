import { describe, expect, it } from "vitest";
import { formatDate, toInputDate } from "./dates";

describe("formatDate", () => {
	it("formats a Date object", () => {
		const result = formatDate(new Date("2026-04-03"));
		expect(result).toBe("03 Apr 2026");
	});

	it("formats a date string", () => {
		const result = formatDate("2025-12-25");
		expect(result).toBe("25 Dec 2025");
	});

	it("handles different months", () => {
		expect(formatDate("2026-01-15")).toBe("15 Jan 2026");
		expect(formatDate("2026-06-01")).toBe("01 Jun 2026");
	});
});

describe("toInputDate", () => {
	it("formats a Date to YYYY-MM-DD", () => {
		const result = toInputDate(new Date("2026-04-03T12:00:00Z"));
		expect(result).toBe("2026-04-03");
	});

	it("formats a date string to YYYY-MM-DD", () => {
		const result = toInputDate("2026-12-25T00:00:00Z");
		expect(result).toBe("2026-12-25");
	});
});
