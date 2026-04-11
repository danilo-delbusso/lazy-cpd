// Next.js 16 uses proxy.ts, NOT middleware.ts — do not rename this file.
// See: https://nextjs.org/docs/messages/middleware-to-proxy
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const WEAK_SECRETS = new Set(["change-me-in-production", "secret", "jwt_secret", "changeme"]);

function getSecret(): Uint8Array {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error("JWT_SECRET environment variable is required");
	if (process.env.NODE_ENV === "production" && (secret.length < 32 || WEAK_SECRETS.has(secret))) {
		throw new Error(
			"JWT_SECRET is too weak for production. Generate one with: openssl rand -base64 32",
		);
	}
	return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
	const session = request.cookies.get("cpd_session");

	if (!session?.value) {
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}

	try {
		await jwtVerify(session.value, getSecret(), {
			issuer: "cpd-portal",
			audience: "cpd-portal",
		});
		return NextResponse.next();
	} catch {
		const response = NextResponse.redirect(new URL("/admin/login", request.url));
		response.cookies.delete("cpd_session");
		return response;
	}
}

export const config = {
	matcher: ["/admin/((?!login).*)"],
};
