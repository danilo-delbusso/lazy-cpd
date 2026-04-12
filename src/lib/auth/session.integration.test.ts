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
import { verifyToken } from "./jwt";
import { createSession, destroySession, getSession } from "./session";

process.env.JWT_SECRET = "integration-test-secret-at-least-32chars!!";

describe("session management", () => {
	beforeEach(() => {
		mockCookieStore.clear();
	});

	it("createSession sets a valid JWT cookie", async () => {
		await createSession({ role: "admin" });

		expect(mockCookieStore.has("cpd_session")).toBe(true);
		const token = mockCookieStore.get("cpd_session")?.value;

		// The token should be verifiable
		expect(token).toBeDefined();
		const payload = await verifyToken(token as string);
		expect(payload).toEqual({ role: "admin" });
	});

	it("getSession returns the admin payload when cookie is set", async () => {
		await createSession({ role: "admin" });
		const session = await getSession();

		expect(session).toEqual({ role: "admin" });
	});

	it("getSession returns null when no cookie is set", async () => {
		const session = await getSession();
		expect(session).toBeNull();
	});

	it("getSession returns null with an invalid token", async () => {
		mockCookieStore.set("cpd_session", { value: "garbage-token" });
		const session = await getSession();
		expect(session).toBeNull();
	});

	it("destroySession removes the cookie", async () => {
		await createSession({ role: "admin" });
		expect(mockCookieStore.has("cpd_session")).toBe(true);

		await destroySession();
		expect(mockCookieStore.has("cpd_session")).toBe(false);
	});

	it("getSession returns null after destroySession", async () => {
		await createSession({ role: "admin" });
		await destroySession();
		const session = await getSession();
		expect(session).toBeNull();
	});
});
