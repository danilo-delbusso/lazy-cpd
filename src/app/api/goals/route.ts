import { createId } from "@paralleldrive/cuid2";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createGoal, getAllGoals } from "@/lib/db/queries/goals";
import { goalSchema } from "@/lib/validations/goal";

export async function GET() {
	const goals = await getAllGoals();
	return NextResponse.json(goals, {
		headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
	});
}

export const POST = withAuth(async (request) => {
	const body = await request.json().catch(() => null);
	const parsed = goalSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const goal = await createGoal({ id: createId(), ...parsed.data });
	return NextResponse.json(goal, { status: 201 });
});
