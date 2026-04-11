// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock "server-only" — it throws in non-server environments
vi.mock("server-only", () => ({}));

const VALID_SECRET = "a-very-strong-secret-that-is-at-least-32-chars-long";

describe("jwt", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.stubEnv("JWT_SECRET", VALID_SECRET);
		vi.stubEnv("NODE_ENV", "test");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("signs and verifies a valid token", async () => {
		const { signToken, verifyToken } = await import("./jwt");
		const token = await signToken({ role: "admin" });
		expect(typeof token).toBe("string");
		expect(token.split(".")).toHaveLength(3);

		const payload = await verifyToken(token);
		expect(payload).toEqual({ role: "admin" });
	});

	it("returns null for an invalid token", async () => {
		const { verifyToken } = await import("./jwt");
		const result = await verifyToken("invalid.token.here");
		expect(result).toBeNull();
	});

	it("returns null for a tampered token", async () => {
		const { signToken, verifyToken } = await import("./jwt");
		const token = await signToken({ role: "admin" });
		const parts = token.split(".");
		parts[2] = "tampered";
		const result = await verifyToken(parts.join("."));
		expect(result).toBeNull();
	});

	it("throws when JWT_SECRET is missing", async () => {
		vi.stubEnv("JWT_SECRET", "");
		const { signToken } = await import("./jwt");
		await expect(signToken({ role: "admin" })).rejects.toThrow("JWT_SECRET");
	});

	it("throws when JWT_SECRET is weak in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("JWT_SECRET", "secret");
		const { signToken } = await import("./jwt");
		await expect(signToken({ role: "admin" })).rejects.toThrow("too weak");
	});

	it("throws when JWT_SECRET is too short in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("JWT_SECRET", "short");
		const { signToken } = await import("./jwt");
		await expect(signToken({ role: "admin" })).rejects.toThrow("too weak");
	});

	it("accepts strong secrets in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("JWT_SECRET", VALID_SECRET);
		const { signToken } = await import("./jwt");
		const token = await signToken({ role: "admin" });
		expect(typeof token).toBe("string");
	});
});
