vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { registerFormatTools } from "./formats";

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;
const handlers = new Map<string, ToolHandler>();

const mockServer = {
	registerTool: (name: string, _opts: unknown, handler: ToolHandler) => {
		handlers.set(name, handler);
	},
};

function parseContent(result: unknown): unknown {
	const r = result as { content: { text: string }[] };
	return JSON.parse(r.content[0].text);
}

function isError(result: unknown): boolean {
	return !!(result as { isError?: boolean }).isError;
}

describe("MCP format tools", () => {
	it("registers list_formats", () => {
		registerFormatTools(mockServer as never);
		expect(handlers.has("list_formats")).toBe(true);
	});

	it("list_formats returns formats array", async () => {
		registerFormatTools(mockServer as never);
		const result = await handlers.get("list_formats")?.({});
		expect(isError(result)).toBe(false);
		const data = parseContent(result) as unknown[];
		expect(Array.isArray(data)).toBe(true);
	});
});
