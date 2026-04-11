"use client";

import { motion } from "motion/react";
import type { ActivityCardData } from "@/components/activities/activity-card";
import { ActivityFormatBadge } from "@/components/activities/activity-format-badge";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";

const dotColors: Record<string, string> = {
	in_progress: "bg-green-500",
	completed: "bg-sky-500",
	upcoming: "bg-stone-400",
};

const leftBorderColors: Record<string, string> = {
	in_progress: "border-l-green-300",
	completed: "border-l-sky-300",
	upcoming: "border-l-stone-200",
};

interface ActivityRowProps {
	activity: ActivityCardData;
	index: number;
	onClick: () => void;
	showGoalTitle?: boolean;
}

const MAX_TAGS = 3;

export function ActivityRow({
	activity: a,
	index,
	onClick,
	showGoalTitle = true,
}: Readonly<ActivityRowProps>) {
	const visibleTags = a.tags.slice(0, MAX_TAGS);
	const overflowCount = a.tags.length - MAX_TAGS;

	return (
		<motion.div
			initial={{ opacity: 0, x: -8 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.015 }}
			whileHover={{ y: -1 }}
			onClick={onClick}
			className={cn(
				"flex cursor-pointer items-center gap-3 border-l-4 bg-white/80 px-4 py-2.5 transition-all duration-150 hover:bg-stone-50/80",
				leftBorderColors[a.status] ?? leftBorderColors.upcoming,
			)}
		>
			{/* Left zone: status dot + title + goal */}
			<div className="flex min-w-0 flex-1 items-center gap-2.5">
				<span
					className={cn("h-2 w-2 shrink-0 rounded-full", dotColors[a.status] ?? dotColors.upcoming)}
				/>
				<span className="line-clamp-2 text-sm font-medium text-stone-800 sm:line-clamp-1">
					{a.title}
				</span>
				{showGoalTitle && a.goalTitle && (
					<span className="hidden shrink-0 text-xs text-amber-600 sm:inline">{a.goalTitle}</span>
				)}
			</div>

			{/* Right zone: tags + format + date */}
			<div className="hidden shrink-0 items-center gap-2 sm:flex">
				<div className="hidden items-center gap-1 md:flex">
					{visibleTags.map((tag) => (
						<span
							key={tag}
							className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700 ring-1 ring-yellow-200"
						>
							{tag}
						</span>
					))}
					{overflowCount > 0 && (
						<span className="rounded-full bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium text-yellow-600 ring-1 ring-yellow-200">
							+{overflowCount}
						</span>
					)}
				</div>
				<ActivityFormatBadge name={a.formatName} color={a.formatColor} />
				<span className="w-20 shrink-0 text-right text-xs text-stone-400">
					{formatDate(a.fullDate)}
				</span>
			</div>
		</motion.div>
	);
}
