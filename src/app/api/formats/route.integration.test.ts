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
import { createActivity, deleteActivity } from "@/lib/db/queries/activities";
import { deleteFormat } from "@/lib/db/queries/formats";
import { createGoal, deleteGoal } from "@/lib/db/queries/goals";
import { GET, POST } from "./route";
import { PUT, DELETE } from "./[id]/route";

const TEST_PREFIX = `test-api-fmt-${Date.now()}`;
const formatIds: string[] = [];
const goalIds: string[] = [];
const activityIds: string[] = [];

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

describe("formats API routes", () => {
	beforeAll(async () => {
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

	describe("GET /api/formats", () => {
		it("returns a list of formats", async () => {
			const res = await GET();
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(Array.isArray(data)).toBe(true);
		});
	});

	describe("POST /api/formats", () => {
		it("creates a format with valid data", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/formats", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: `${TEST_PREFIX} Webinar`,
					color: "#ff6600",
				}),
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			const data = await res.json();

			expect(res.status).toBe(201);
			expect(data.name).toBe(`${TEST_PREFIX} Webinar`);
			expect(data.slug).toBeDefined();
			expect(data.color).toBe("#ff6600");
			formatIds.push(data.id);
		});

		it("creates a format with explicit slug", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/formats", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: `${TEST_PREFIX} Course`,
					slug: `test_fmt_course_${Date.now()}`,
					color: "#00ff66",
				}),
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			const data = await res.json();

			expect(res.status).toBe(201);
			expect(data.slug).toMatch(/^test_fmt_course_\d+$/);
			formatIds.push(data.id);
		});

		it("returns 400 for invalid data", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/formats", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "x", color: "not-a-color" }),
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			expect(res.status).toBe(400);
		});

		it("returns 401 without auth", async () => {
			clearAuthCookie();
			const req = new Request("http://localhost/api/formats", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: `${TEST_PREFIX} NoAuth`, color: "#aabbcc" }),
			});

			const res = await POST(req as any, { params: Promise.resolve({}) } as any);
			expect(res.status).toBe(401);
			await setAuthCookie();
		});
	});

	describe("PUT /api/formats/[id]", () => {
		it("updates an existing format", async () => {
			await setAuthCookie();
			const id = formatIds[0];
			const req = new Request(`http://localhost/api/formats/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ color: "#999999" }),
			});

			const res = await PUT(req as any, makeContext(id) as any);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.color).toBe("#999999");
		});

		it("returns 404 for non-existent id", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/formats/nope", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ color: "#000000" }),
			});

			const res = await PUT(req as any, makeContext("nope") as any);
			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /api/formats/[id]", () => {
		it("returns 409 when activities reference the format", async () => {
			await setAuthCookie();
			const fmtId = formatIds[0];

			// Create goal + activity referencing this format
			const gId = createId();
			const aId = createId();
			goalIds.push(gId);
			activityIds.push(aId);

			await createGoal({
				id: gId,
				title: `${TEST_PREFIX} Goal for fmt delete`,
				description: "Testing format delete via API route",
			});
			await createActivity({
				id: aId,
				goalId: gId,
				title: `${TEST_PREFIX} Activity for fmt delete`,
				fullDate: new Date("2025-10-01"),
				status: "upcoming",
				formatId: fmtId,
				tags: [],
			});

			const req = new Request(`http://localhost/api/formats/${fmtId}`, { method: "DELETE" });
			const res = await DELETE(req as any, makeContext(fmtId) as any);
			expect(res.status).toBe(409);
			const data = await res.json();
			expect(data.error).toContain("Cannot delete format");
		});

		it("deletes a format with no activities", async () => {
			await setAuthCookie();
			const id = formatIds[1]; // the one with explicit slug, no activities

			const req = new Request(`http://localhost/api/formats/${id}`, { method: "DELETE" });
			const res = await DELETE(req as any, makeContext(id) as any);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.success).toBe(true);
			formatIds.splice(formatIds.indexOf(id), 1);
		});

		it("returns 404 for non-existent id", async () => {
			await setAuthCookie();
			const req = new Request("http://localhost/api/formats/nope", { method: "DELETE" });
			const res = await DELETE(req as any, makeContext("nope") as any);
			expect(res.status).toBe(404);
		});
	});
});
