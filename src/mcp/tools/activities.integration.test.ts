vi.mock("server-only", () => ({}));

import { createId } from "@paralleldrive/cuid2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deleteActivity } from "@/lib/db/queries/activities";
import { createFormat, deleteFormat } from "@/lib/db/queries/formats";
import { createGoal, deleteGoal } from "@/lib/db/queries/goals";
import { registerActivityTools } from "./activities";

const TEST_PREFIX = `test-mcp-act-${Date.now()}`;
const goalIds: string[] = [];
const formatIds: string[] = [];
const activityIds: string[] = [];

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

describe("MCP activity tools", () => {
	let goalId: string;
	let formatId: string;

	beforeAll(async () => {
		registerActivityTools(mockServer as never);

		goalId = createId();
		formatId = createId();
		goalIds.push(goalId);
		formatIds.push(formatId);

		await createGoal({
			id: goalId,
			title: `${TEST_PREFIX} Goal`,
			description: "Goal for MCP activity tool tests",
		});
		await createFormat({
			id: formatId,
			name: `${TEST_PREFIX} Format`,
			slug: `${TEST_PREFIX}_format`,
			color: "#00ff00",
		});
	});

	afterAll(async () => {
		for (const id of activityIds) {
			await deleteActivity(id).catch(() => {});
		}
		for (const id of goalIds) {
			await deleteGoal(id).catch(() => {});
		}
		for (const id of formatIds) {
			await deleteFormat(id).catch(() => {});
		}
	});

	it("registers all five activity tools", () => {
		expect(handlers.has("list_activities")).toBe(true);
		expect(handlers.has("get_activity")).toBe(true);
		expect(handlers.has("create_activity")).toBe(true);
		expect(handlers.has("update_activity")).toBe(true);
		expect(handlers.has("delete_activity")).toBe(true);
	});

	describe("create_activity", () => {
		it("creates an activity", async () => {
			const result = await handlers.get("create_activity")!({
				goalId,
				title: `${TEST_PREFIX} Activity`,
				fullDate: "2025-06-15",
				formatId,
				status: "upcoming",
				notes: "Some notes",
				references: null,
				tags: ["test"],
			});
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { id: string; title: string };
			expect(data.id).toBeDefined();
			expect(data.title).toContain("Activity");
			activityIds.push(data.id);
		});
	});

	describe("list_activities", () => {
		it("returns paginated activities", async () => {
			const result = await handlers.get("list_activities")!({ page: 1, limit: 10 });
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { data: unknown[]; total: number };
			expect(data.data).toBeDefined();
			expect(typeof data.total).toBe("number");
		});

		it("filters by goalId", async () => {
			const result = await handlers.get("list_activities")!({ goalId, page: 1, limit: 10 });
			const data = parseContent(result) as { data: { goalId: string }[] };
			for (const item of data.data) {
				expect(item.goalId).toBe(goalId);
			}
		});
	});

	describe("get_activity", () => {
		it("returns an activity by id", async () => {
			const id = activityIds[0];
			const result = await handlers.get("get_activity")!({ id });
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { id: string };
			expect(data.id).toBe(id);
		});

		it("returns error for non-existent id", async () => {
			const result = await handlers.get("get_activity")!({ id: "nonexistent-act-id" });
			expect(isError(result)).toBe(true);
		});
	});

	describe("update_activity", () => {
		it("updates an activity", async () => {
			const id = activityIds[0];
			const result = await handlers.get("update_activity")!({
				id,
				status: "completed",
			});
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { status: string };
			expect(data.status).toBe("completed");
		});

		it("updates fullDate with string conversion", async () => {
			const id = activityIds[0];
			const result = await handlers.get("update_activity")!({
				id,
				fullDate: "2025-12-25",
			});
			expect(isError(result)).toBe(false);
		});

		it("returns error when no fields provided", async () => {
			const result = await handlers.get("update_activity")!({ id: activityIds[0] });
			expect(isError(result)).toBe(true);
		});

		it("returns error for non-existent id", async () => {
			const result = await handlers.get("update_activity")!({
				id: "nonexistent-act-id",
				title: "Nope",
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("delete_activity", () => {
		it("deletes an activity", async () => {
			// Create one for deletion
			const createResult = await handlers.get("create_activity")!({
				goalId,
				title: `${TEST_PREFIX} Delete Me`,
				fullDate: "2025-11-01",
				formatId,
				status: "upcoming",
				tags: [],
			});
			const created = parseContent(createResult) as { id: string };

			const result = await handlers.get("delete_activity")!({ id: created.id });
			expect(isError(result)).toBe(false);
			const data = parseContent(result) as { deleted: boolean };
			expect(data.deleted).toBe(true);
		});

		it("returns error for non-existent id", async () => {
			const result = await handlers.get("delete_activity")!({ id: "nonexistent-act-id" });
			expect(isError(result)).toBe(true);
		});
	});
});
