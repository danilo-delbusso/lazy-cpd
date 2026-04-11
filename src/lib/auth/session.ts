import "server-only";
import { cookies } from "next/headers";
import type { AdminPayload } from "./jwt";
import { signToken, verifyToken } from "./jwt";

const COOKIE_NAME = "cpd_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

export async function createSession(payload: AdminPayload): Promise<void> {
	const token = await signToken(payload);
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: COOKIE_MAX_AGE,
		path: "/",
	});
}

export async function getSession(): Promise<AdminPayload | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_NAME)?.value;
	if (!token) return null;
	return verifyToken(token);
}

export async function destroySession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIE_NAME);
}
