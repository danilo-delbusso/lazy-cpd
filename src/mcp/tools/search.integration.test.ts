vi.mock("server-only", () => ({}));

import { createId } from "@paralleldrive/cuid2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createGoal, deleteGoal } from "@/lib/db/queries/goals";
import { registerSearchTools } from "./search";

const TEST_PREFIX = `test-mcp-search-${Date.now()}`;
const goalIds: string[] = [];

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

describe("MCP search tools", () => {
	beforeAll(async () => {
		registerSearchTools(mockServer as never);

		const goalId = createId();
		goalIds.push(goalId);
		await createGoal({
			id: goalId,
			title: `${TEST_PREFIX} Searchable Goal`,
			description: "A goal created for search tool integration tests",
			status: "open",
			tags: ["search-test"],
		});
	});

	afterAll(async () => {
		for (const id of goalIds) {
			await deleteGoal(id).catch(() => {});
		}
	});

	it("registers search tool", () => {
		expect(handlers.has("search")).toBe(true);
	});

	it("searches goals by text", async () => {
		const result = await handlers.get("search")?.({
			query: TEST_PREFIX,
			scope: "goals",
		});
		expect(isError(result)).toBe(false);
		const data = parseContent(result) as { goals: { title: string }[] };
		expect(data.goals.length).toBeGreaterThan(0);
		expect(data.goals[0].title).toContain(TEST_PREFIX);
	});

	it("searches with scope 'all'", async () => {
		const result = await handlers.get("search")?.({
			query: TEST_PREFIX,
			scope: "all",
		});
		expect(isError(result)).toBe(false);
		const data = parseContent(result) as { goals?: unknown[]; activities?: unknown[] };
		expect(data.goals).toBeDefined();
		expect(data.activities).toBeDefined();
	});

	it("returns empty results for non-matching query", async () => {
		const result = await handlers.get("search")?.({
			query: "zzz-no-match-ever-12345",
			scope: "goals",
		});
		expect(isError(result)).toBe(false);
		const data = parseContent(result) as { goals: unknown[] };
		expect(data.goals.length).toBe(0);
	});

	it("escapes SQL wildcards in query", async () => {
		const result = await handlers.get("search")?.({
			query: "100%_match",
			scope: "goals",
		});
		expect(isError(result)).toBe(false);
		const data = parseContent(result) as { goals: unknown[] };
		// Should not throw, results may be empty
		expect(Array.isArray(data.goals)).toBe(true);
	});
});
