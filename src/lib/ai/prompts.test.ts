import { describe, expect, it } from "vitest";
import { expandNotesPrompt } from "./prompts";

describe("expandNotesPrompt", () => {
	it("returns system and user prompts", () => {
		const result = expandNotesPrompt("my notes", "Activity Title");
		expect(result.system).toContain("CPD");
		expect(result.user).toContain("Activity Title");
		expect(result.user).toContain("===USER DATA===");
		expect(result.user).toContain("my notes");
		expect(result.user).toContain("===END USER DATA===");
	});

	it("includes goal title when provided", () => {
		const result = expandNotesPrompt("notes", "Activity", "My Goal");
		expect(result.user).toContain('part of the goal: "My Goal"');
	});

	it("omits goal context when goalTitle is undefined", () => {
		const result = expandNotesPrompt("notes", "Activity");
		expect(result.user).not.toContain("part of the goal");
	});

	it("wraps user data in delimiters", () => {
		const result = expandNotesPrompt("sensitive <prompt>", "Title");
		expect(result.user).toContain("===USER DATA===\nsensitive <prompt>\n===END USER DATA===");
	});

	it("requests markdown bullet list output", () => {
		const result = expandNotesPrompt("notes", "Title");
		expect(result.user).toContain("markdown bullet list");
		expect(result.user).toContain("No headings");
	});
});
