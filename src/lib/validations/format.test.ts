import { describe, expect, it } from "vitest";
import { formatSchema, slugify } from "./format";

describe("formatSchema", () => {
	it("accepts valid format data", () => {
		const result = formatSchema.safeParse({
			name: "BCS Webinar",
			color: "#2563eb",
		});
		expect(result.success).toBe(true);
	});

	it("rejects name shorter than 2 chars", () => {
		const result = formatSchema.safeParse({
			name: "A",
			color: "#2563eb",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid hex color", () => {
		const result = formatSchema.safeParse({
			name: "Webinar",
			color: "red",
		});
		expect(result.success).toBe(false);
	});

	it("rejects 3-char hex", () => {
		const result = formatSchema.safeParse({
			name: "Webinar",
			color: "#f00",
		});
		expect(result.success).toBe(false);
	});

	it("accepts valid slug", () => {
		const result = formatSchema.safeParse({
			name: "Webinar",
			color: "#2563eb",
			slug: "webinar",
		});
		expect(result.success).toBe(true);
	});

	it("rejects slug with spaces", () => {
		const result = formatSchema.safeParse({
			name: "Webinar",
			color: "#2563eb",
			slug: "web inar",
		});
		expect(result.success).toBe(false);
	});
});

describe("slugify", () => {
	it("converts to lowercase", () => {
		expect(slugify("BCS Webinar")).toBe("bcs_webinar");
	});

	it("replaces spaces with underscores", () => {
		expect(slugify("Online Course")).toBe("online_course");
	});

	it("removes special characters", () => {
		expect(slugify("E-book")).toBe("e_book");
	});

	it("trims leading/trailing underscores", () => {
		expect(slugify("-hello-")).toBe("hello");
	});

	it("handles multiple spaces", () => {
		expect(slugify("Audio  Book")).toBe("audio_book");
	});
});
