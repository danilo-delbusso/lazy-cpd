import "server-only";
import { jwtVerify, SignJWT } from "jose";

export interface AdminPayload {
	role: "admin";
}

const TOKEN_EXPIRY = "24h";

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

const ISSUER = "cpd-portal";
const AUDIENCE = "cpd-portal";

export async function signToken(payload: AdminPayload): Promise<string> {
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setIssuer(ISSUER)
		.setAudience(AUDIENCE)
		.setSubject("admin")
		.setExpirationTime(TOKEN_EXPIRY)
		.sign(getSecret());
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
	try {
		const { payload } = await jwtVerify(token, getSecret(), {
			issuer: ISSUER,
			audience: AUDIENCE,
		});
		if (payload.role !== "admin") return null;
		return { role: "admin" };
	} catch {
		return null;
	}
}
