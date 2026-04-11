vi.mock("server-only", () => ({}));

import { createId } from "@paralleldrive/cuid2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createGoal, deleteGoal } from "@/lib/db/queries/goals";
import { registerGoalTools } from "./goals";

const TEST_PREFIX = `test-mcp-goals-${Date.now()}`;
const goalIds: string[] = [];

// Capture registered tool handlers
type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;
const handlers = new Map<string, ToolHandler>();

const mockServer = {
	registerTool: (name: string, _opts: unknown, handler: ToolHandler) => {
		handlers.set(name, handler);
	},
};

function parseContent(result: unknown): unknown {
	const r = result as { content: { text: string }[]; isError?: boolean };
	return JSON.parse(r.content[0].text);
}

function isError(result: unknown): boolean {
	return !!(result as { isError?: boolean }).isError;
}

describe("MCP goal tools", () => {
	let goalId: string;

	beforeAll(async () => {
		registerGoalTools(mockServer as never);

		goalId = createId();
		goalIds.push(goalId);
		await createGoal({
			id: goalId,
			title: `${TEST_PREFIX} Existing Goal`,
			description: "A goal for MCP goal tool integration tests",
			status: "open",
			tags: ["mcp-test"],
		});
	});

	afterAll(async () => {
		for (const id of goalIds) {
			await deleteGoal(id).catch(() => {});
		}
	});

	it("registers all five goal tools", () => {
		expect(handlers.has("list_goals")).toBe(true);
		expect(handlers.has("get_goal")).toBe(true);
		expect(handlers.has("create_goal")).toBe(true);
		expect(handlers.has("update_goal")).toBe(true);
		expect(handlers.has("delete_goal")).toBe(true);
	});

	describe("list_goals", () => {
		it("returns goals without filter", async () => {
			const result = await handlers.get("list_goals")?.({});
			const data = parseContent(result) as unknown[];
			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
		});

		it("filters by status", async () => {
			const result = await handlers.get("list_goals")?.({ status: "open" });
			const data = parseContent(result) as { status: string }[];
			for (const g of data) {
				expect(g.status).toBe("open");
			}
		});
	});

	describe("get_goal", () => {
		it("returns a goal by id", async () => {
			const result = await handlers.get("get_goal")?.({ id: goalId });
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { id: string };
			expect(data.id).toBe(goalId);
		});

		it("returns error for non-existent id", async () => {
			const result = await handlers.get("get_goal")?.({ id: "nonexistent-goal-id" });
			expect(isError(result)).toBe(true);
		});
	});

	describe("create_goal", () => {
		it("creates a goal", async () => {
			const result = await handlers.get("create_goal")?.({
				title: `${TEST_PREFIX} Created Via Tool`,
				description: "Created through the MCP create_goal tool handler",
				status: "upcoming",
				tags: ["created"],
			});
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { id: string; title: string };
			expect(data.id).toBeDefined();
			expect(data.title).toContain("Created Via Tool");
			goalIds.push(data.id);
		});
	});

	describe("update_goal", () => {
		it("updates a goal", async () => {
			const result = await handlers.get("update_goal")?.({
				id: goalId,
				title: `${TEST_PREFIX} Updated Via Tool`,
			});
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { title: string };
			expect(data.title).toContain("Updated Via Tool");
		});

		it("returns error when no fields provided", async () => {
			const result = await handlers.get("update_goal")?.({ id: goalId });
			expect(isError(result)).toBe(true);
		});

		it("returns error for non-existent id", async () => {
			const result = await handlers.get("update_goal")?.({
				id: "nonexistent-goal-id",
				title: "Nope",
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("delete_goal", () => {
		it("returns warning without confirm", async () => {
			const result = await handlers.get("delete_goal")?.({ id: goalId, confirm: false });
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { warning: string; activityCount: number };
			expect(data.warning).toContain("activities");
			expect(typeof data.activityCount).toBe("number");
		});

		it("deletes with confirm", async () => {
			const tempId = createId();
			await createGoal({
				id: tempId,
				title: `${TEST_PREFIX} Delete Target`,
				description: "Will be deleted by MCP tool test",
			});

			const result = await handlers.get("delete_goal")?.({ id: tempId, confirm: true });
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { deleted: boolean };
			expect(data.deleted).toBe(true);
		});

		it("returns error for non-existent id with confirm", async () => {
			const result = await handlers.get("delete_goal")?.({
				id: "nonexistent-goal-id",
				confirm: true,
			});
			expect(isError(result)).toBe(true);
		});
	});
});
