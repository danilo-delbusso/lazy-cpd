"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { GoalStatusBadge } from "@/components/goals/goal-status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/dates";
import type { GoalWithStats } from "@/types";

interface GoalCardProps {
	goal: GoalWithStats;
}

export function GoalCard({ goal }: Readonly<GoalCardProps>) {
	const completionPct =
		goal.totalActivities > 0 ? Math.round((goal.completedCount / goal.totalActivities) * 100) : 0;

	return (
		<Link href={`/goals/${goal.id}`}>
			<motion.div
				whileHover={{ y: -2 }}
				transition={{ type: "spring", stiffness: 300 }}
				className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-600/5"
			>
				<div className="flex items-start justify-between gap-3">
					<h3 className="font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
						{goal.title}
					</h3>
					<GoalStatusBadge status={goal.status} />
				</div>

				<p className="mt-2 line-clamp-2 text-sm text-slate-500">{goal.description}</p>

				{/* Progress bar */}
				{goal.totalActivities > 0 && (
					<div className="mt-4">
						<div className="flex items-center justify-between text-xs text-slate-400">
							<span>{completionPct}% complete</span>
							<span>{goal.totalActivities} activities</span>
						</div>
						<div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${completionPct}%` }}
								transition={{ duration: 0.6, ease: "easeOut" }}
								className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
							/>
						</div>
					</div>
				)}

				{/* Stats row */}
				<div className="mt-4 flex flex-wrap gap-2 text-xs">
					{goal.upcomingCount > 0 && (
						<Badge colorClasses="bg-amber-50 text-amber-700 ring-1 ring-amber-600/10">
							{goal.upcomingCount} upcoming
						</Badge>
					)}
					{goal.inProgressCount > 0 && (
						<Badge colorClasses="bg-sky-50 text-sky-700 ring-1 ring-sky-600/10">
							{goal.inProgressCount} in progress
						</Badge>
					)}
					{goal.completedCount > 0 && (
						<Badge colorClasses="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
							{goal.completedCount} done
						</Badge>
					)}
				</div>

				{/* Date range */}
				{goal.firstDate && (
					<p className="mt-3 text-xs text-slate-400">
						{formatDate(goal.firstDate)}
						{goal.lastDate && goal.lastDate !== goal.firstDate && (
							<> — {formatDate(goal.lastDate)}</>
						)}
					</p>
				)}
			</motion.div>
		</Link>
	);
}
