import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { deleteActivity, getActivityById, updateActivity } from "@/lib/db/queries/activities";
import { activityUpdateSchema } from "@/lib/validations/activity";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
	const { id } = await context.params;
	const activity = await getActivityById(id);

	if (!activity) {
		return NextResponse.json({ error: "Activity not found" }, { status: 404 });
	}

	return NextResponse.json(activity);
}

export const PUT = withAuth(async (request, context) => {
	const { id } = await context.params;
	const body = await request.json().catch(() => null);
	const parsed = activityUpdateSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const activity = await updateActivity(id, parsed.data);
	if (!activity) {
		return NextResponse.json({ error: "Activity not found" }, { status: 404 });
	}

	return NextResponse.json(activity);
});

export const DELETE = withAuth(async (_request, context) => {
	const { id } = await context.params;
	const deleted = await deleteActivity(id);

	if (!deleted) {
		return NextResponse.json({ error: "Activity not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true });
});

export function OPTIONS() {
	return new Response(null, { status: 405, headers: { Allow: "GET, PUT, DELETE" } });
}
