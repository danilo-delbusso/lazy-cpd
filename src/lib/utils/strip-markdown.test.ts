import { describe, expect, it } from "vitest";
import { stripMarkdown } from "./strip-markdown";

describe("stripMarkdown", () => {
	it("strips heading markers", () => {
		expect(stripMarkdown("# Hello")).toBe("Hello");
		expect(stripMarkdown("## World")).toBe("World");
		expect(stripMarkdown("###### Deep")).toBe("Deep");
	});

	it("strips bold markers", () => {
		expect(stripMarkdown("**bold**")).toBe("bold");
		expect(stripMarkdown("__bold__")).toBe("bold");
	});

	it("strips italic markers", () => {
		expect(stripMarkdown("*italic*")).toBe("italic");
		expect(stripMarkdown("_italic_")).toBe("italic");
	});

	it("strips strikethrough", () => {
		expect(stripMarkdown("~~deleted~~")).toBe("deleted");
	});

	it("strips inline code", () => {
		expect(stripMarkdown("`code`")).toBe("code");
	});

	it("strips code blocks", () => {
		expect(stripMarkdown("```js\nconst x = 1;\n```")).toBe("");
	});

	it("strips unordered list markers", () => {
		expect(stripMarkdown("- item")).toBe("item");
		expect(stripMarkdown("* item")).toBe("item");
		expect(stripMarkdown("+ item")).toBe("item");
	});

	it("strips ordered list markers", () => {
		expect(stripMarkdown("1. item")).toBe("item");
		expect(stripMarkdown("42. item")).toBe("item");
	});

	it("strips blockquotes", () => {
		expect(stripMarkdown("> quote")).toBe("quote");
	});

	it("strips links keeping text", () => {
		expect(stripMarkdown("[click here](https://example.com)")).toBe("click here");
	});

	it("strips images keeping alt text", () => {
		expect(stripMarkdown("![alt text](image.png)")).toBe("alt text");
	});

	it("collapses multiple newlines", () => {
		expect(stripMarkdown("a\n\n\nb")).toBe("a b");
	});

	it("converts single newlines to spaces", () => {
		expect(stripMarkdown("a\nb")).toBe("a b");
	});

	it("trims result", () => {
		expect(stripMarkdown("  hello  ")).toBe("hello");
	});

	it("handles combined markdown", () => {
		const input =
			"# Title\n\n**Bold** and *italic* with [a link](http://x.com)\n\n- item one\n- item two";
		const result = stripMarkdown(input);
		expect(result).toBe("Title Bold and italic with a link item one item two");
	});

	it("truncates input over 10000 chars to prevent ReDoS", () => {
		const long = "a".repeat(15000);
		const result = stripMarkdown(long);
		expect(result.length).toBeLessThanOrEqual(10000);
	});

	it("handles empty string", () => {
		expect(stripMarkdown("")).toBe("");
	});
});
