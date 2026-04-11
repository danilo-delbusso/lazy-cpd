import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { deleteGoal, getGoalWithActivities, updateGoal } from "@/lib/db/queries/goals";
import { goalUpdateSchema } from "@/lib/validations/goal";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
	const { id } = await context.params;
	const goal = await getGoalWithActivities(id);

	if (!goal) {
		return NextResponse.json({ error: "Goal not found" }, { status: 404 });
	}

	return NextResponse.json(goal);
}

export const PUT = withAuth(async (request, context) => {
	const { id } = await context.params;
	const body = await request.json().catch(() => null);
	const parsed = goalUpdateSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const goal = await updateGoal(id, parsed.data);
	if (!goal) {
		return NextResponse.json({ error: "Goal not found" }, { status: 404 });
	}

	return NextResponse.json(goal);
});

export const DELETE = withAuth(async (_request, context) => {
	const { id } = await context.params;
	const deleted = await deleteGoal(id);

	if (!deleted) {
		return NextResponse.json({ error: "Goal not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true });
});
