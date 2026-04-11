vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { registerStatsTools } from "./stats";

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

describe("MCP stats tools", () => {
	it("registers get_stats", () => {
		registerStatsTools(mockServer as never);
		expect(handlers.has("get_stats")).toBe(true);
	});

	it("returns aggregate statistics", async () => {
		registerStatsTools(mockServer as never);
		const result = await handlers.get("get_stats")!({});
		expect(isError(result)).toBe(false);

		const data = parseContent(result) as {
			goals: { total: number; open: number; upcoming: number; completed: number };
			activities: { total: number; upcoming: number; in_progress: number; completed: number };
			uniqueFormatsUsed: number;
			dateRange: { earliest: string | null; latest: string | null };
			recentActivities: unknown[];
		};

		expect(typeof data.goals.total).toBe("number");
		expect(typeof data.goals.open).toBe("number");
		expect(typeof data.goals.upcoming).toBe("number");
		expect(typeof data.goals.completed).toBe("number");
		expect(typeof data.activities.total).toBe("number");
		expect(typeof data.uniqueFormatsUsed).toBe("number");
		expect(data.dateRange).toBeDefined();
		expect(Array.isArray(data.recentActivities)).toBe(true);
	});
});
