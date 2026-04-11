"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { GoalDetailView } from "@/components/goals/goal-detail-view";
import type { ActivityWithJoins } from "@/hooks/use-activities";
import { useResponsiveView } from "@/hooks/use-responsive-view";
import type { PaginatedResult } from "@/types";

export function GoalDetailPageClient({
	goalId,
	initialGoal,
	initialActivities,
}: Readonly<{
	goalId: string;
	initialGoal: Parameters<typeof GoalDetailView>[0]["initialGoal"];
	initialActivities: PaginatedResult<ActivityWithJoins>;
}>) {
	const viewMode = useResponsiveView();
	const router = useRouter();

	return (
		<motion.div
			key={`goal-${goalId}`}
			initial={{ opacity: 0, x: 16 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -16 }}
			transition={{ duration: 0.2 }}
		>
			<GoalDetailView
				goalId={goalId}
				onBack={() => router.push("/")}
				viewMode={viewMode}
				initialGoal={initialGoal}
				initialActivities={initialActivities}
			/>
		</motion.div>
	);
}
