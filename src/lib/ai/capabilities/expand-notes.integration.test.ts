vi.mock("server-only", () => ({}));

// Mock the Anthropic client to avoid real API calls
const mockStreamFn = vi.fn();
const mockStream = {
	on: vi.fn().mockReturnThis(),
	finalMessage: vi.fn().mockResolvedValue({
		content: [{ type: "text", text: "- **Mocked learning**: This is a mock response" }],
	}),
	[Symbol.asyncIterator]: async function* () {
		yield { type: "content_block_delta", delta: { type: "text_delta", text: "- **Mocked**" } };
	},
};
mockStreamFn.mockReturnValue(mockStream);

vi.mock("@anthropic-ai/sdk", () => ({
	default: class MockAnthropic {
		messages = { stream: mockStreamFn };
	},
}));

import { beforeEach, describe, expect, it } from "vitest";
import { expandNotesStream } from "./expand-notes";

process.env.ANTHROPIC_API_KEY = "test-key-not-real";

describe("expand-notes capability", () => {
	beforeEach(() => {
		mockStreamFn.mockClear();
	});

	it("returns a stream object from expandNotesStream", () => {
		const stream = expandNotesStream(
			"learned about testing patterns",
			"Integration Testing Workshop",
			"Improve Testing Skills",
		);

		expect(stream).toBeDefined();
		expect(stream).toBe(mockStream);
	});

	it("calls the Anthropic stream API with correct parameters", () => {
		expandNotesStream("some notes", "Activity Title", "Goal Title");

		expect(mockStreamFn).toHaveBeenCalledTimes(1);
		const callArgs = mockStreamFn.mock.calls[0][0];

		expect(callArgs.max_tokens).toBe(1000);
		expect(callArgs.system).toContain("CPD");
		expect(callArgs.messages).toHaveLength(1);
		expect(callArgs.messages[0].role).toBe("user");
		expect(callArgs.messages[0].content).toContain("Activity Title");
		expect(callArgs.messages[0].content).toContain("Goal Title");
	});

	it("includes goal context in prompt when goalTitle is provided", () => {
		expandNotesStream("notes", "My Activity", "My Goal");

		const content = mockStreamFn.mock.calls[0][0].messages[0].content;
		expect(content).toContain('part of the goal: "My Goal"');
	});

	it("omits goal context when goalTitle is not provided", () => {
		expandNotesStream("notes about testing", "My Activity");

		const content = mockStreamFn.mock.calls[0][0].messages[0].content;
		expect(content).toContain("My Activity");
		expect(content).not.toContain("part of the goal");
	});

	it("wraps user notes in delimiters", () => {
		expandNotesStream("my raw notes here", "Title");

		const content = mockStreamFn.mock.calls[0][0].messages[0].content;
		expect(content).toContain("===USER DATA===");
		expect(content).toContain("my raw notes here");
		expect(content).toContain("===END USER DATA===");
	});
});
