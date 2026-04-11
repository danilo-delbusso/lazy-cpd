"use client";

import { motion } from "motion/react";
import { TimelineView } from "@/components/timeline/timeline-view";
import type { ActivityWithJoins } from "@/hooks/use-activities";
import { useResponsiveView } from "@/hooks/use-responsive-view";
import type { PaginatedResult } from "@/types";
import { usePublicLayout } from "../public-layout-context";

export function TimelinePageClient({
	initialActivities,
}: {
	initialActivities: PaginatedResult<ActivityWithJoins>;
}) {
	const { yearFilter, activityFilter } = usePublicLayout();
	const viewMode = useResponsiveView();

	return (
		<motion.div
			key="timeline"
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.2 }}
		>
			<TimelineView
				yearFilter={yearFilter}
				activityFilter={activityFilter}
				viewMode={viewMode}
				initialActivities={initialActivities}
			/>
		</motion.div>
	);
}
