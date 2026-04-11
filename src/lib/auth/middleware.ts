import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "./session";

type RouteHandler = (
	request: NextRequest,
	context: { params: Promise<Record<string, string>> },
) => Promise<NextResponse | Response>;

/** Wrap an API route handler to require authentication */
export function withAuth(handler: RouteHandler): RouteHandler {
	return async (request, context) => {
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const { method, url } = request;
		const path = new URL(url).pathname;
		console.log(`[audit] admin ${method} ${path}`);
		return handler(request, context);
	};
}
