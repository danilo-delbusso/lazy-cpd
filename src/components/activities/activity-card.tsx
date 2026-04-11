"use client";

import { motion } from "motion/react";
import { ActivityFormatBadge } from "@/components/activities/activity-format-badge";
import { ActivityStatusBadge } from "@/components/activities/activity-status-badge";
import { SpotlightCard } from "@/components/effects/spotlight-card";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";
import { stripMarkdown } from "@/lib/utils/strip-markdown";
import type { ActivityStatusValue } from "@/lib/validations/activity";

const spotlightColors: Record<string, string> = {
	in_progress: "rgba(34, 197, 94, 0.07)",
	upcoming: "rgba(120, 113, 108, 0.10)",
	completed: "rgba(56, 189, 248, 0.08)",
};

const borderColors: Record<string, string> = {
	completed: "border-sky-300 hover:border-sky-400",
	in_progress: "border-green-300 hover:border-green-400",
	upcoming: "border-stone-200 hover:border-stone-300",
};

export interface ActivityCardData {
	id: string;
	title: string;
	fullDate: string;
	status: string;
	notes: string | null;
	tags: string[];
	formatName: string;
	formatColor: string;
	goalTitle?: string;
}

interface ActivityCardProps {
	activity: ActivityCardData;
	index: number;
	onClick: () => void;
	showGoalTitle?: boolean;
}

export function ActivityCard({
	activity: a,
	index,
	onClick,
	showGoalTitle = true,
}: ActivityCardProps) {
	return (
		<motion.div
			key={a.id}
			initial={{ opacity: 0, x: -8 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.03 }}
			onClick={onClick}
			className="cursor-pointer"
		>
			<SpotlightCard
				spotlightColor={spotlightColors[a.status] ?? spotlightColors.upcoming}
				className={cn(
					"relative flex h-full flex-col rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:shadow-md",
					borderColors[a.status] ?? borderColors.upcoming,
				)}
			>
				<ActivityStatusBadge
					status={a.status as ActivityStatusValue}
					className="absolute -top-px -right-px z-10 rounded-none rounded-bl-lg rounded-tr-xl border-b border-l px-3.5 py-1"
				/>

				<div className="flex gap-4 p-4 pb-2">
					<div className="min-w-0 flex-1">
						<p className="pr-24 font-medium text-stone-800">{a.title}</p>
						{showGoalTitle && a.goalTitle && (
							<p className="mt-0.5 text-xs text-amber-600">{a.goalTitle}</p>
						)}
						{a.notes && (
							<p className="mt-1.5 line-clamp-2 text-sm text-stone-500">{stripMarkdown(a.notes)}</p>
						)}
					</div>
					<div className="mt-6 shrink-0">
						<span className="text-xs font-medium text-stone-400">{formatDate(a.fullDate)}</span>
					</div>
				</div>

				<div className="mt-auto flex items-end justify-between gap-2 px-4 pb-3">
					<div className="flex min-w-0 flex-wrap gap-1">
						{a.tags?.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700 ring-1 ring-yellow-200"
							>
								{tag}
							</span>
						))}
					</div>
					<div className="shrink-0">
						<ActivityFormatBadge name={a.formatName} color={a.formatColor} />
					</div>
				</div>
			</SpotlightCard>
		</motion.div>
	);
}
