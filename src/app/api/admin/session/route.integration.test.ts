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

import { beforeEach, describe, expect, it } from "vitest";
import { signToken } from "@/lib/auth/jwt";
import { GET, DELETE } from "./route";

process.env.JWT_SECRET = "integration-test-secret-at-least-32chars!!";

describe("admin session route", () => {
	beforeEach(() => {
		mockCookieStore.clear();
	});

	describe("GET /api/admin/session", () => {
		it("returns 401 when no session cookie", async () => {
			const res = await GET();
			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.authenticated).toBe(false);
		});

		it("returns 401 when session cookie has invalid token", async () => {
			mockCookieStore.set("cpd_session", { value: "invalid-token" });
			const res = await GET();
			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.authenticated).toBe(false);
		});

		it("returns 200 when session cookie has valid token", async () => {
			const token = await signToken({ role: "admin" });
			mockCookieStore.set("cpd_session", { value: token });
			const res = await GET();
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.authenticated).toBe(true);
		});
	});

	describe("DELETE /api/admin/session", () => {
		it("destroys session and returns success", async () => {
			const token = await signToken({ role: "admin" });
			mockCookieStore.set("cpd_session", { value: token });

			const res = await DELETE();
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.success).toBe(true);
			expect(mockCookieStore.has("cpd_session")).toBe(false);
		});

		it("succeeds even when no session exists", async () => {
			const res = await DELETE();
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.success).toBe(true);
		});
	});
});
