import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ActivityWithJoins } from "@/hooks/use-activities";
import { getAllActivities } from "@/lib/db/queries/activities";
import { getGoalWithActivities } from "@/lib/db/queries/goals";
import type { PaginatedResult } from "@/types";
import { GoalDetailPageClient } from "./goal-detail-page-client";

type Props = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default async function GoalPage({ params }: Props) {
	const { id } = await params;

	const [goal, activitiesPage] = await Promise.all([
		getGoalWithActivities(id),
		getAllActivities({ goalId: id }, { page: 1, limit: 30 }),
	]);

	if (!goal) {
		notFound();
	}

	// JSON round-trip to match the shape the API returns (dates as strings)
	// so initialData is consistent with subsequent TanStack Query refetches
	const serializedGoal = JSON.parse(JSON.stringify(goal));
	const serializedActivities = JSON.parse(
		JSON.stringify(activitiesPage),
	) as PaginatedResult<ActivityWithJoins>;

	return (
		<GoalDetailPageClient
			goalId={id}
			initialGoal={serializedGoal}
			initialActivities={serializedActivities}
		/>
	);
}
