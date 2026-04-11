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
import { POST } from "./route";

process.env.JWT_SECRET = "integration-test-secret-at-least-32chars!!";
// @ts-expect-error — NODE_ENV is readonly in types but writable at runtime for tests
process.env.NODE_ENV = "test";

describe("admin login route", () => {
	beforeEach(() => {
		mockCookieStore.clear();
		process.env.ADMIN_PASSWORD = "test-admin-password-long-enough";
	});

	it("returns 500 when ADMIN_PASSWORD is not set", async () => {
		delete process.env.ADMIN_PASSWORD;

		const req = new Request("http://localhost/api/admin/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ password: "anything" }),
		});

		const res = await POST(req);
		expect(res.status).toBe(500);
		const data = await res.json();
		expect(data.error).toBe("Server configuration error");
	});

	it("returns 400 when password is missing", async () => {
		const req = new Request("http://localhost/api/admin/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});

		const res = await POST(req);
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("Password is required");
	});

	it("returns 400 for invalid JSON body", async () => {
		const req = new Request("http://localhost/api/admin/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "not json",
		});

		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("returns 401 for wrong password", async () => {
		const req = new Request("http://localhost/api/admin/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-forwarded-for": "login-test-wrong",
			},
			body: JSON.stringify({ password: "wrong-password" }),
		});

		const res = await POST(req);
		expect(res.status).toBe(401);
		const data = await res.json();
		expect(data.error).toBe("Invalid credentials");
	});

	it("returns 200 and sets session cookie on correct password", async () => {
		const req = new Request("http://localhost/api/admin/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-forwarded-for": "login-test-correct",
			},
			body: JSON.stringify({ password: "test-admin-password-long-enough" }),
		});

		const res = await POST(req);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);

		// Session cookie should have been set via the mock
		expect(mockCookieStore.has("cpd_session")).toBe(true);
	});

	it("rate limits after too many attempts from same IP", async () => {
		const ip = `rate-limit-test-${Date.now()}`;

		// Make 6 requests (limit is 5) — all with wrong password
		for (let i = 0; i < 6; i++) {
			const req = new Request("http://localhost/api/admin/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-forwarded-for": ip,
				},
				body: JSON.stringify({ password: "wrong" }),
			});
			const res = await POST(req);

			if (i < 5) {
				// First 5 should be 401 (wrong password)
				expect(res.status).toBe(401);
			} else {
				// 6th should be rate limited
				expect(res.status).toBe(429);
				const data = await res.json();
				expect(data.error).toContain("Too many login attempts");
			}
		}
	});
});
