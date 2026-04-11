"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";
import type { GoalStatus } from "@/lib/validations/goal";
import type { GoalWithStats } from "@/types";

const dotColors: Record<string, string> = {
	open: "bg-green-500",
	upcoming: "bg-stone-400",
	completed: "bg-sky-500",
};

const leftBorderColors: Record<string, string> = {
	open: "border-l-green-300",
	upcoming: "border-l-stone-200",
	completed: "border-l-sky-300",
};

const statDotColors: Record<string, string> = {
	upcoming: "bg-orange-400",
	inProgress: "bg-green-400",
	completed: "bg-sky-400",
};

const MAX_TAGS = 2;

interface GoalRowProps {
	goal: GoalWithStats;
	onClick: () => void;
	index: number;
}

export function GoalRow({ goal, onClick, index }: GoalRowProps) {
	const visibleTags = goal.tags.slice(0, MAX_TAGS);
	const overflowCount = goal.tags.length - MAX_TAGS;

	return (
		<motion.div
			initial={{ opacity: 0, x: -8 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.015 }}
			whileHover={{ y: -1 }}
			onClick={onClick}
			className={cn(
				"flex cursor-pointer items-center gap-3 border-l-4 bg-white/80 px-4 py-2.5 transition-all duration-150 hover:bg-stone-50/80",
				leftBorderColors[goal.status] ?? leftBorderColors.upcoming,
			)}
		>
			{/* Left zone: status dot + title */}
			<div className="flex min-w-0 flex-1 items-center gap-2.5">
				<span
					className={cn(
						"h-2 w-2 shrink-0 rounded-full",
						dotColors[goal.status] ?? dotColors.upcoming,
					)}
				/>
				<span className="line-clamp-2 text-sm font-medium text-stone-800 sm:line-clamp-1">
					{goal.title}
				</span>
			</div>

			{/* Right-center: compact stats */}
			<div className="hidden items-center gap-2 text-xs tabular-nums text-stone-500 lg:flex">
				{goal.upcomingCount > 0 && (
					<span className="flex items-center gap-1">
						<span className={cn("h-1.5 w-1.5 rounded-full", statDotColors.upcoming)} />
						{goal.upcomingCount}
					</span>
				)}
				{goal.inProgressCount > 0 && (
					<span className="flex items-center gap-1">
						<span className={cn("h-1.5 w-1.5 rounded-full", statDotColors.inProgress)} />
						{goal.inProgressCount}
					</span>
				)}
				{goal.completedCount > 0 && (
					<span className="flex items-center gap-1">
						<span className={cn("h-1.5 w-1.5 rounded-full", statDotColors.completed)} />
						{goal.completedCount}
					</span>
				)}
			</div>

			{/* Far right: tags + date range — hidden on mobile */}
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
				{goal.firstDate && (
					<span className="text-xs text-stone-400">
						{formatDate(goal.firstDate)}
						{goal.lastDate && goal.lastDate !== goal.firstDate && (
							<> — {formatDate(goal.lastDate)}</>
						)}
					</span>
				)}
			</div>
		</motion.div>
	);
}
