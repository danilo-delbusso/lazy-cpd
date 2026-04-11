import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";

export async function GET() {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ authenticated: false }, { status: 401 });
	}
	return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
	await destroySession();
	return NextResponse.json({ success: true });
}
