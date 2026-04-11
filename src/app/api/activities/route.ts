import { createId } from "@paralleldrive/cuid2";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createActivity, getAllActivities } from "@/lib/db/queries/activities";
import { activitySchema, activityStatusValues } from "@/lib/validations/activity";
import type { ActivityFilters } from "@/types";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
	const url = new URL(request.url);
	const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10));
	const limit = Math.min(
		MAX_LIMIT,
		Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "25", 10)),
	);

	const filters: ActivityFilters = {};
	const goalId = url.searchParams.get("goalId");
	const status = url.searchParams.get("status");
	const formatId = url.searchParams.get("formatId");
	const from = url.searchParams.get("from");
	const to = url.searchParams.get("to");

	if (goalId) filters.goalId = goalId;
	if (status && activityStatusValues.includes(status as ActivityFilters["status"] & string)) {
		filters.status = status as ActivityFilters["status"];
	}
	if (formatId) filters.formatId = formatId;
	if (from) {
		const d = new Date(from);
		if (!Number.isNaN(d.getTime())) filters.from = d;
	}
	if (to) {
		const d = new Date(to);
		if (!Number.isNaN(d.getTime())) filters.to = d;
	}

	const result = await getAllActivities(filters, { page, limit });
	return NextResponse.json(result);
}

export const POST = withAuth(async (request) => {
	const body = await request.json().catch(() => null);
	const parsed = activitySchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const activity = await createActivity({ id: createId(), ...parsed.data });
	return NextResponse.json(activity, { status: 201 });
});
