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

const mockIsAIConfigured = vi.fn();
const mockExpandNotesStream = vi.fn();

vi.mock("@/lib/ai/anthropic.server", () => ({
	isAIConfigured: () => mockIsAIConfigured(),
}));

vi.mock("@/lib/ai/capabilities/expand-notes", () => ({
	expandNotesStream: (...args: unknown[]) => mockExpandNotesStream(...args),
}));

import { beforeEach, describe, expect, it } from "vitest";
import { signToken } from "@/lib/auth/jwt";
import { POST } from "./route";

process.env.JWT_SECRET = "integration-test-secret-at-least-32chars!!";

async function setAuthCookie() {
	const token = await signToken({ role: "admin" });
	mockCookieStore.set("cpd_session", { value: token });
}

function makeRequest(body?: unknown): Request {
	return new Request("http://localhost/api/ai/expand-notes", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: body !== undefined ? JSON.stringify(body) : "invalid json{{{",
	});
}

describe("expand-notes route", () => {
	beforeEach(async () => {
		mockCookieStore.clear();
		mockIsAIConfigured.mockReset();
		mockExpandNotesStream.mockReset();
		await setAuthCookie();
	});

	it("returns 401 without auth", async () => {
		mockCookieStore.clear();
		const req = makeRequest({ notes: "test", activityTitle: "Test" });
		const res = await POST(req as never, { params: Promise.resolve({}) } as never);
		expect(res.status).toBe(401);
	});

	it("returns 503 when AI is not configured", async () => {
		mockIsAIConfigured.mockReturnValue(false);
		const req = makeRequest({ notes: "test", activityTitle: "Test" });
		const res = await POST(req as never, { params: Promise.resolve({}) } as never);
		expect(res.status).toBe(503);
		const data = await res.json();
		expect(data.error).toContain("AI is not configured");
	});

	it("returns 400 when notes are missing", async () => {
		mockIsAIConfigured.mockReturnValue(true);
		const req = makeRequest({ activityTitle: "Test" });
		const res = await POST(req as never, { params: Promise.resolve({}) } as never);
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toContain("required");
	});

	it("returns 400 when activityTitle is missing", async () => {
		mockIsAIConfigured.mockReturnValue(true);
		const req = makeRequest({ notes: "some notes" });
		const res = await POST(req as never, { params: Promise.resolve({}) } as never);
		expect(res.status).toBe(400);
	});

	it("returns 400 for invalid JSON body", async () => {
		mockIsAIConfigured.mockReturnValue(true);
		const req = new Request("http://localhost/api/ai/expand-notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "not json{{{",
		});
		const res = await POST(req as never, { params: Promise.resolve({}) } as never);
		expect(res.status).toBe(400);
	});

	it("returns SSE stream on valid request", async () => {
		mockIsAIConfigured.mockReturnValue(true);

		const mockStream = {
			on: vi.fn().mockReturnThis(),
			finalMessage: vi.fn().mockResolvedValue({
				content: [{ type: "text", text: "expanded notes" }],
			}),
		};
		mockExpandNotesStream.mockReturnValue(mockStream);

		const req = makeRequest({
			notes: "learned about testing",
			activityTitle: "Testing Workshop",
			goalTitle: "Improve Quality",
		});
		const res = await POST(req as never, { params: Promise.resolve({}) } as never);

		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/event-stream");
		expect(res.headers.get("Cache-Control")).toBe("no-cache");

		expect(mockExpandNotesStream).toHaveBeenCalledWith(
			"learned about testing",
			"Testing Workshop",
			"Improve Quality",
		);
	});
});
