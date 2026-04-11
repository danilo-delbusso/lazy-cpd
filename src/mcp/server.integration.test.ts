vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { createMcpServer } from "./server";

describe("createMcpServer", () => {
	it("returns an McpServer instance", () => {
		const server = createMcpServer();
		expect(server).toBeDefined();
		expect(typeof server.connect).toBe("function");
	});

	it("creates independent server instances on each call", () => {
		const a = createMcpServer();
		const b = createMcpServer();
		expect(a).not.toBe(b);
	});
});
