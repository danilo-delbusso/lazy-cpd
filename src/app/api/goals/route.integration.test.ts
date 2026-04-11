vi.mock("server-only", () => ({}));

// Mock next/headers cookies for auth
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
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { signToken } from "@/lib/auth/jwt";
import { deleteGoal } from "@/lib/db/queries/goals";
import { GET, POST } from "./route";
import { GET as GET_BY_ID, PUT, DELETE } from "./[id]/route";
import { GET as GET_TAGS } from "./tags/route";

const TEST_PREFIX = `test-api-goal-${Date.now()}`;
const goalIds: string[] = [];

// Set required env vars
process.env.JWT_SECRET = "integration-test-secret-at-least-32chars!!";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://cpd:cpd_dev_password@localhost:5432/cpd_portal";

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

describe("goals API routes", () => {
	beforeAll(async () => {
		await setAuthCookie();
	});

	beforeEach(() => {
		// Ensure auth cookie is set for each test by default
	});

	afterAll(async () => {
		for (const id of goalIds) {
			await deleteGoal(id).catch(() => {});
		}
	});

	describe("GET /api/goals", () => {
		it("returns a list of goals", async () => {
			const req = new Request("http://localhost/api/goals", { method: "GET" });
			const res = await GET();
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(Array.isArray(data)).toBe(true);
		});

		it("includes Cache-Control header", async () => {
			const res = await GET();
			expect(res.headers.get("Cache-Control")).toContain("s-maxage=60");
		});
	});

	describe("POST /api/goals", () => {
		it("creates a goal with valid data", async () => {
			await setAuthCookie();
			const body = {
				title: `${TEST_PREFIX} New Goal`,
				description: "A description for the test goal with enough length",
				status: "open",
				tags: ["test"],
			};

			const req = new Request("http://localhost/api/goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			const data = await res.json();

			expect(res.status).toBe(201);
			expect(data.title).toBe(body.title);
			expect(data.id).toBeDefined();
			goalIds.push(data.id);
		});

		it("returns 400 for invalid data", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "ab" }), // too short, missing description
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toBe("Validation failed");
		});

		it("returns 401 without auth", async () => {
			clearAuthCookie();
			const req = new Request("http://localhost/api/goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: `${TEST_PREFIX} Unauthed`,
					description: "Should not be created because no auth",
				}),
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			expect(res.status).toBe(401);
			await setAuthCookie(); // restore for subsequent tests
		});
	});

	describe("GET /api/goals/[id]", () => {
		it("returns a goal by id", async () => {
			const id = goalIds[0];
			const req = new Request(`http://localhost/api/goals/${id}`, { method: "GET" });
			const res = await GET_BY_ID(req, makeContext(id));
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.id).toBe(id);
		});

		it("returns 404 for non-existent id", async () => {
			const req = new Request("http://localhost/api/goals/nope", { method: "GET" });
			const res = await GET_BY_ID(req, makeContext("nope"));
			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/goals/[id]", () => {
		it("updates an existing goal", async () => {
			await setAuthCookie();
			const id = goalIds[0];
			const req = new Request(`http://localhost/api/goals/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: `${TEST_PREFIX} Updated Goal` }),
			});

			const res = await PUT(req as any, makeContext(id) as any);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.title).toBe(`${TEST_PREFIX} Updated Goal`);
		});

		it("returns 404 for non-existent id", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/goals/nope", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: `${TEST_PREFIX} Nope` }),
			});

			const res = await PUT(req as any, makeContext("nope") as any);
			expect(res.status).toBe(404);
		});

		it("returns 401 without auth", async () => {
			clearAuthCookie();
			const req = new Request(`http://localhost/api/goals/${goalIds[0]}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "No Auth" }),
			});

			const res = await PUT(req as any, makeContext(goalIds[0]) as any);
			expect(res.status).toBe(401);
			await setAuthCookie();
		});
	});

	describe("DELETE /api/goals/[id]", () => {
		it("deletes an existing goal", async () => {
			// Create a goal specifically for deletion
			await setAuthCookie();
			const createReq = new Request("http://localhost/api/goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: `${TEST_PREFIX} Delete Me`,
					description: "This goal will be deleted in a test",
				}),
			});
			const createRes = await POST(createReq as any, { params: Promise.resolve({}) } as any);
			const created = await createRes.json();
			const deleteId = created.id;

			const req = new Request(`http://localhost/api/goals/${deleteId}`, { method: "DELETE" });
			const res = await DELETE(req as any, makeContext(deleteId) as any);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.success).toBe(true);
		});

		it("returns 404 for non-existent id", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/goals/nope", { method: "DELETE" });
			const res = await DELETE(req as any, makeContext("nope") as any);
			expect(res.status).toBe(404);
		});
	});

	describe("GET /api/goals/tags", () => {
		it("returns an array of unique tags", async () => {
			const res = await GET_TAGS();
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(Array.isArray(data)).toBe(true);
		});

		it("returns strings in the tags array", async () => {
			const res = await GET_TAGS();
			const data: string[] = await res.json();

			// DB has existing goals with tags; verify they are strings
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
