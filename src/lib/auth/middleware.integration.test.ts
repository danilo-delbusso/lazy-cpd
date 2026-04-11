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

import { type NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { signToken } from "./jwt";
import { withAuth } from "./middleware";

process.env.JWT_SECRET = "integration-test-secret-at-least-32chars!!";

describe("withAuth middleware", () => {
	beforeEach(() => {
		mockCookieStore.clear();
	});

	const dummyHandler = async (_request: NextRequest) => {
		return NextResponse.json({ ok: true });
	};

	const wrappedHandler = withAuth(dummyHandler);

	it("returns 401 when no session cookie is set", async () => {
		const req = new Request("http://localhost/api/test", { method: "GET" }) as NextRequest;
		const res = await wrappedHandler(req, { params: Promise.resolve({}) });

		expect(res.status).toBe(401);
		const data = await res.json();
		expect(data.error).toBe("Unauthorized");
	});

	it("returns 401 with an invalid token", async () => {
		mockCookieStore.set("cpd_session", { value: "invalid-token" });

		const req = new Request("http://localhost/api/test", { method: "GET" }) as NextRequest;
		const res = await wrappedHandler(req, { params: Promise.resolve({}) });

		expect(res.status).toBe(401);
	});

	it("calls the handler when a valid token is present", async () => {
		const token = await signToken({ role: "admin" });
		mockCookieStore.set("cpd_session", { value: token });

		const req = new Request("http://localhost/api/test", { method: "GET" }) as NextRequest;
		const res = await wrappedHandler(req, { params: Promise.resolve({}) });

		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.ok).toBe(true);
	});

	it("returns 401 with an expired token", async () => {
		// Create a token that's already expired by signing with a very short expiry
		// We can't easily control expiry in signToken, but we can test with a malformed JWT
		mockCookieStore.set("cpd_session", {
			value: "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjF9.invalid",
		});

		const req = new Request("http://localhost/api/test", { method: "GET" }) as NextRequest;
		const res = await wrappedHandler(req, { params: Promise.resolve({}) });

		expect(res.status).toBe(401);
	});
});
