vi.mock("server-only", () => ({}));

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET, DELETE, POST } from "./route";

const ORIGINAL_TOKEN = process.env.CPD_MCP_TOKEN;

describe("MCP route", () => {
	beforeAll(() => {
		process.env.CPD_MCP_TOKEN = "test-mcp-token-for-integration";
	});

	afterAll(() => {
		if (ORIGINAL_TOKEN) {
			process.env.CPD_MCP_TOKEN = ORIGINAL_TOKEN;
		} else {
			delete process.env.CPD_MCP_TOKEN;
		}
	});

	describe("GET /api/mcp", () => {
		it("returns health check", async () => {
			const res = await GET();
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.status).toBe("ok");
			expect(data.service).toBe("cpd-portal-mcp");
		});
	});

	describe("DELETE /api/mcp", () => {
		it("returns 405", async () => {
			const res = await DELETE();
			expect(res.status).toBe(405);
		});
	});

	describe("POST /api/mcp", () => {
		it("returns 401 without authorization header", async () => {
			const req = new Request("http://localhost/api/mcp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});

			const res = await POST(req);
			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.error).toBe("Unauthorized");
		});

		it("returns 401 with wrong token", async () => {
			const req = new Request("http://localhost/api/mcp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer wrong-token",
				},
				body: JSON.stringify({}),
			});

			const res = await POST(req);
			expect(res.status).toBe(401);
		});

		it("returns 401 with malformed authorization header", async () => {
			const req = new Request("http://localhost/api/mcp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Basic dGVzdA==",
				},
				body: JSON.stringify({}),
			});

			const res = await POST(req);
			expect(res.status).toBe(401);
		});

		it("returns 401 when CPD_MCP_TOKEN is not set", async () => {
			const saved = process.env.CPD_MCP_TOKEN;
			delete process.env.CPD_MCP_TOKEN;

			const req = new Request("http://localhost/api/mcp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer some-token",
				},
				body: JSON.stringify({}),
			});

			const res = await POST(req);
			expect(res.status).toBe(401);

			process.env.CPD_MCP_TOKEN = saved;
		});
	});
});
