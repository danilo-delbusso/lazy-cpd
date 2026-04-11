vi.mock("server-only", () => ({}));

const mockCookieStore = new Map<string, { value: string }>();
vi.mock("next/headers", () => ({
	cookies: async () => ({
		get: (name: string) => mockCookieStore.get(name),
		set: (name: string, value: string, _opts?: unknown) => {
			mockCookieStore.set(name, { value });
		},
		delete: (name: string) => {
			mockCookieStore.delete(name);
		},
	}),
}));

import { createId } from "@paralleldrive/cuid2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signToken } from "@/lib/auth/jwt";
import { deleteActivity } from "@/lib/db/queries/activities";
import { createFormat, deleteFormat } from "@/lib/db/queries/formats";
import { createGoal, deleteGoal } from "@/lib/db/queries/goals";
import { DELETE, GET as GET_BY_ID, OPTIONS, PUT } from "./[id]/route";
import { GET, POST } from "./route";
import { GET as GET_TAGS } from "./tags/route";

const TEST_PREFIX = `test-api-act-${Date.now()}`;
const goalIds: string[] = [];
const formatIds: string[] = [];
const activityIds: string[] = [];

process.env.JWT_SECRET = "integration-test-secret-at-least-32chars!!";
process.env.DATABASE_URL =
	process.env.DATABASE_URL || "postgresql://cpd:cpd_dev_password@localhost:5432/cpd_portal";

let goalId: string;
let formatId: string;

async function setAuthCookie() {
	const token = await signToken({ role: "admin" });
	mockCookieStore.set("cpd_session", { value: token });
}

function clearAuthCookie() {
	mockCookieStore.delete("cpd_session");
}

function makeContext(id: string) {
	return { params: Promise.resolve({ id }) };
}

describe("activities API routes", () => {
	beforeAll(async () => {
		goalId = createId();
		formatId = createId();
		goalIds.push(goalId);
		formatIds.push(formatId);

		await createGoal({
			id: goalId,
			title: `${TEST_PREFIX} Goal`,
			description: "Goal for activity API integration tests",
		});
		await createFormat({
			id: formatId,
			name: `${TEST_PREFIX} Workshop`,
			slug: `${TEST_PREFIX}_workshop`,
			color: "#aabb00",
		});
		await setAuthCookie();
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

	describe("GET /api/activities", () => {
		it("returns paginated activities", async () => {
			const req = new Request("http://localhost/api/activities", { method: "GET" });
			const res = await GET(req);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data).toHaveProperty("data");
			expect(data).toHaveProperty("total");
			expect(data).toHaveProperty("page");
			expect(data).toHaveProperty("totalPages");
		});

		it("respects page and limit query params", async () => {
			const req = new Request("http://localhost/api/activities?page=1&limit=2", { method: "GET" });
			const res = await GET(req);
			const data = await res.json();

			expect(data.limit).toBe(2);
			expect(data.page).toBe(1);
		});

		it("caps limit at 100", async () => {
			const req = new Request("http://localhost/api/activities?limit=999", { method: "GET" });
			const res = await GET(req);
			const data = await res.json();

			expect(data.limit).toBe(100);
		});

		it("filters by goalId", async () => {
			const req = new Request(`http://localhost/api/activities?goalId=${goalId}`, {
				method: "GET",
			});
			const res = await GET(req);
			const data = await res.json();

			for (const item of data.data) {
				expect(item.goalId).toBe(goalId);
			}
		});
	});

	describe("POST /api/activities", () => {
		it("creates an activity with valid data", async () => {
			await setAuthCookie();
			const body = {
				goalId,
				title: `${TEST_PREFIX} Activity A`,
				fullDate: "2025-04-15",
				formatId,
				status: "upcoming",
				tags: ["integration"],
				notes: "Test notes for the activity",
			};

			const req = new Request("http://localhost/api/activities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			const data = await res.json();

			expect(res.status).toBe(201);
			expect(data.title).toBe(body.title);
			expect(data.goalId).toBe(goalId);
			activityIds.push(data.id);
		});

		it("returns 400 for invalid data", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/activities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "ab" }), // too short, missing required fields
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			expect(res.status).toBe(400);
		});

		it("returns 401 without auth", async () => {
			clearAuthCookie();
			const req = new Request("http://localhost/api/activities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					goalId,
					title: `${TEST_PREFIX} No Auth`,
					fullDate: "2025-05-01",
					formatId,
				}),
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			expect(res.status).toBe(401);
			await setAuthCookie();
		});
	});

	describe("GET /api/activities/[id]", () => {
		it("returns an activity by id", async () => {
			const id = activityIds[0];
			const req = new Request(`http://localhost/api/activities/${id}`, { method: "GET" });
			const res = await GET_BY_ID(req, makeContext(id));
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.id).toBe(id);
			expect(data.goalTitle).toBeDefined();
			expect(data.formatName).toBeDefined();
		});

		it("returns 404 for non-existent id", async () => {
			const req = new Request("http://localhost/api/activities/nope", { method: "GET" });
			const res = await GET_BY_ID(req, makeContext("nope"));
			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/activities/[id]", () => {
		it("updates an existing activity", async () => {
			await setAuthCookie();
			const id = activityIds[0];
			const req = new Request(`http://localhost/api/activities/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "completed" }),
			});

			const res = await PUT(req as any, makeContext(id) as any);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.status).toBe("completed");
		});

		it("returns 404 for non-existent id", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/activities/nope", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: `${TEST_PREFIX} Nope Updated` }),
			});

			const res = await PUT(req as any, makeContext("nope") as any);
			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /api/activities/[id]", () => {
		it("deletes an existing activity", async () => {
			await setAuthCookie();
			// Create one specifically for deletion
			const createReq = new Request("http://localhost/api/activities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					goalId,
					title: `${TEST_PREFIX} Delete Me`,
					fullDate: "2025-11-01",
					formatId,
				}),
			});
			const createRes = await POST(createReq as any, { params: Promise.resolve({}) } as any);
			const created = await createRes.json();

			const req = new Request(`http://localhost/api/activities/${created.id}`, {
				method: "DELETE",
			});
			const res = await DELETE(req as any, makeContext(created.id) as any);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.success).toBe(true);
		});

		it("returns 404 for non-existent id", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/activities/nope", { method: "DELETE" });
			const res = await DELETE(req as any, makeContext("nope") as any);
			expect(res.status).toBe(404);
		});
	});

	describe("OPTIONS /api/activities/[id]", () => {
		it("returns 405 with Allow header", () => {
			const res = OPTIONS();
			expect(res.status).toBe(405);
			expect(res.headers.get("Allow")).toBe("GET, PUT, DELETE");
		});
	});

	describe("GET /api/activities/tags", () => {
		it("returns an array of unique tags", async () => {
			const res = await GET_TAGS();
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(Array.isArray(data)).toBe(true);
		});

		it("returns strings in the tags array", async () => {
			const res = await GET_TAGS();
			const data: string[] = await res.json();

			// DB has existing activities with tags; verify they are strings
			if (data.length > 0) {
				expect(typeof data[0]).toBe("string");
			}
		});

		it("includes Cache-Control header", async () => {
			const res = await GET_TAGS();
			expect(res.headers.get("Cache-Control")).toContain("s-maxage=120");
		});
	});
});
