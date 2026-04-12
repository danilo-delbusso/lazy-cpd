export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ActivityWithJoins } from "@/hooks/use-activities";
import type { GoalDetail } from "@/hooks/use-goals";
import { getAllActivities } from "@/lib/db/queries/activities";
import { getGoalWithActivities } from "@/lib/db/queries/goals";
import { serializeDates } from "@/lib/utils/serialize";
import type { PaginatedResult } from "@/types";
import { GoalDetailPageClient } from "./goal-detail-page-client";

type Props = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Readonly<Props>): Promise<Metadata> {
	const { id } = await params;
	const goal = await getGoalWithActivities(id);

	if (!goal) {
		return { title: "Goal Not Found | CPD Portal" };
	}

	const siteOwner = process.env.NEXT_PUBLIC_SITE_OWNER || "CPD Portal";
	return {
		title: `${goal.title} | CPD Portal — ${siteOwner}`,
		description: goal.description,
	};
}

export default async function GoalPage({ params }: Readonly<Props>) {
	const { id } = await params;

	const [goal, activitiesPage] = await Promise.all([
		getGoalWithActivities(id),
		getAllActivities({ goalId: id }, { page: 1, limit: 30 }),
	]);

	if (!goal) {
		notFound();
	}

	// Convert Date objects to ISO strings so initialData matches TanStack Query refetches
	const serializedGoal = serializeDates(goal) as unknown as GoalDetail;
	const serializedActivities = serializeDates(
		activitiesPage,
	) as unknown as PaginatedResult<ActivityWithJoins>;

	return (
		<GoalDetailPageClient
			goalId={id}
			initialGoal={serializedGoal}
			initialActivities={serializedActivities}
		/>
	);
}
