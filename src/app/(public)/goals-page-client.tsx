"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { GoalsView } from "@/components/goals/goals-view";
import { useResponsiveView } from "@/hooks/use-responsive-view";
import type { GoalWithStats } from "@/types";
import { usePublicLayout } from "./public-layout-context";

export function GoalsPageClient({ initialGoals }: { initialGoals: GoalWithStats[] }) {
	const { goalFilter } = usePublicLayout();
	const viewMode = useResponsiveView();
	const router = useRouter();

	return (
		<motion.div
			key="goals"
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.2 }}
		>
			<GoalsView
				onSelectGoal={(id) => router.push(`/goal/${id}`)}
				filter={goalFilter}
				viewMode={viewMode}
				initialGoals={initialGoals}
			/>
		</motion.div>
	);
}
