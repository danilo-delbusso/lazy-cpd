import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

// Simple in-memory rate limiting with TTL pruning
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = process.env.NODE_ENV === "production" ? 5 : 50;
const WINDOW_MS = 60_000;
const MAX_ENTRIES = 1000;

function pruneEntries() {
	const now = Date.now();
	for (const [key, entry] of attempts) {
		if (now > entry.resetAt) attempts.delete(key);
	}
	// Hard evict oldest entries if still over cap
	if (attempts.size > MAX_ENTRIES) {
		const sorted = [...attempts.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
		for (let i = 0; i < sorted.length - MAX_ENTRIES; i++) {
			attempts.delete(sorted[i][0]);
		}
	}
}

function isRateLimited(ip: string): boolean {
	pruneEntries();
	const now = Date.now();
	const entry = attempts.get(ip);
	if (!entry || now > entry.resetAt) {
		attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
		return false;
	}
	entry.count++;
	return entry.count > MAX_ATTEMPTS;
}

function safeEqual(a: string, b: string): boolean {
	// Hash both inputs to normalise length — eliminates timing leak from
	// different-length buffer allocations and cache effects.
	const hashA = crypto.createHash("sha256").update(a).digest();
	const hashB = crypto.createHash("sha256").update(b).digest();
	return crypto.timingSafeEqual(hashA, hashB);
}

export async function POST(request: Request) {
	const adminPassword = process.env.ADMIN_PASSWORD;
	if (!adminPassword) {
		console.error("[auth] ADMIN_PASSWORD environment variable is not set");
		return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
	}
	if (process.env.NODE_ENV === "production" && adminPassword.length < 16) {
		console.error("[auth] ADMIN_PASSWORD is too short for production (min 16 characters)");
		return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
	}

	const ip = request.headers.get("x-forwarded-for") ?? "unknown";

	if (isRateLimited(ip)) {
		console.warn(`[auth] rate limited login attempts from ${ip}`);
		return NextResponse.json(
			{ error: "Too many login attempts. Try again in a minute." },
			{ status: 429 },
		);
	}

	const body = await request.json().catch(() => null);
	if (!body?.password) {
		return NextResponse.json({ error: "Password is required" }, { status: 400 });
	}

	if (!safeEqual(String(body.password), adminPassword)) {
		console.warn(`[auth] failed login attempt from ${ip}`);
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	await createSession({ role: "admin" });

	return NextResponse.json({ success: true });
}
