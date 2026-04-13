"use client";

import { LayoutGroup, motion } from "motion/react";
import { Masonry } from "react-plock";
import { SpotlightCard } from "@/components/effects/spotlight-card";
import { GoalRow } from "@/components/goals/goal-row";
import { GoalStatusBadge } from "@/components/goals/goal-status-badge";
import { useGoals } from "@/hooks/use-goals";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";
import type { GoalStatus } from "@/lib/validations/goal";
import type { GoalWithStats } from "@/types";

const goalCardRing: Record<string, string> = {
	open: "border-green-300 hover:border-green-400 hover:shadow-green-100/50",
	upcoming: "border-stone-200 hover:border-stone-300 hover:shadow-stone-100/50",
	completed: "border-sky-300 hover:border-sky-400 hover:shadow-sky-100/50",
};

const goalSpotlightColor: Record<string, string> = {
	open: "rgba(34, 197, 94, 0.07)",
	upcoming: "rgba(120, 113, 108, 0.10)",
	completed: "rgba(56, 189, 248, 0.08)",
};

function GoalCard({ goal, onClick }: Readonly<{ goal: GoalWithStats; onClick: () => void }>) {
	const pct =
		goal.totalActivities > 0 ? Math.round((goal.completedCount / goal.totalActivities) * 100) : 0;

	return (
		<SpotlightCard
			spotlightColor={goalSpotlightColor[goal.status] ?? goalSpotlightColor.upcoming}
			className={cn(
				"relative rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:shadow-md",
				goalCardRing[goal.status] ?? goalCardRing.upcoming,
			)}
		>
			<GoalStatusBadge
				status={goal.status}
				className="absolute -top-px -right-px rounded-none rounded-bl-lg rounded-tr-xl border-b border-l px-3.5 py-1"
			/>
			<motion.button
				type="button"
				onClick={onClick}
				whileHover={{ y: -2 }}
				transition={{ type: "spring", stiffness: 300 }}
				className="group w-full cursor-pointer p-5 text-left"
			>
				<h3 className="pr-20 font-semibold text-stone-900 transition-colors group-hover:text-amber-700">
					{goal.title}
				</h3>
				<p className="mt-2 line-clamp-2 text-sm text-stone-500">{goal.description}</p>

				{goal.totalActivities > 0 && (
					<div className="mt-4">
						<div className="flex items-center justify-between text-xs text-stone-400">
							<span>{pct}%</span>
							<span>{goal.totalActivities} activities</span>
						</div>
						<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${pct}%` }}
								transition={{ duration: 0.8, ease: "easeOut" }}
								className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
							/>
						</div>
					</div>
				)}

				{goal.firstDate && (
					<p className="mt-3 text-xs text-stone-400">
						{formatDate(goal.firstDate)}
						{goal.lastDate && goal.lastDate !== goal.firstDate && (
							<> — {formatDate(goal.lastDate)}</>
						)}
					</p>
				)}

				{goal.tags.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-1.5">
						{goal.tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-yellow-50 px-2.5 py-0.5 text-[11px] font-medium text-yellow-700 ring-1 ring-yellow-200"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</motion.button>
		</SpotlightCard>
	);
}

function renderGoalsContent({
	isLoading,
	filtered,
	viewMode,
	onSelectGoal,
}: {
	isLoading: boolean;
	filtered: GoalWithStats[] | undefined;
	viewMode: "grid" | "rows";
	onSelectGoal: (id: string) => void;
}) {
	if (isLoading) {
		return (
			<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{["a", "b", "c", "d", "e", "f"].map((id) => (
					<div
						key={`skel-${id}`}
						className="h-48 animate-pulse rounded-xl border border-stone-200 bg-stone-50"
					/>
				))}
			</div>
		);
	}
	if (filtered && filtered.length > 0) {
		if (viewMode === "rows") {
			return (
				<div className="mt-6 flex flex-col gap-0 divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white/80 shadow-sm">
					{filtered.map((goal, i) => (
						<GoalRow key={goal.id} goal={goal} index={i} onClick={() => onSelectGoal(goal.id)} />
					))}
				</div>
			);
		}
		return (
			<LayoutGroup>
				<Masonry
					items={filtered}
					config={{
						columns: [1, 2, 3],
						gap: [16, 16, 16],
						media: [640, 768, 1024],
					}}
					className="mt-6"
					render={(goal) => (
						<motion.div
							key={goal.id}
							layout
							layoutId={`goal-card-${goal.id}`}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{
								layout: { type: "spring", stiffness: 300, damping: 30 },
								opacity: { duration: 0.25 },
								scale: { duration: 0.25 },
							}}
						>
							<GoalCard goal={goal} onClick={() => onSelectGoal(goal.id)} />
						</motion.div>
					)}
				/>
			</LayoutGroup>
		);
	}
	return <div className="mt-16 text-center text-stone-400">No goals found</div>;
}

export function GoalsView({
	onSelectGoal,
	filter,
	viewMode,
	initialGoals,
}: Readonly<{
	onSelectGoal: (id: string) => void;
	filter: GoalStatus | "all";
	viewMode: "grid" | "rows";
	initialGoals?: GoalWithStats[];
}>) {
	// initialGoals may come from server (JSON-serialized, dates as strings)
	// which matches the shape returned by the API fetch in useGoals
	const { data: goals, isLoading } = useGoals(initialGoals);
	const statusOrder: Record<string, number> = { open: 0, upcoming: 1, completed: 2 };
	const dateValue = (d: Date | string | null | undefined) =>
		d ? new Date(d).getTime() : Number.NEGATIVE_INFINITY;
	const filtered = goals
		?.filter((g) => filter === "all" || g.status === filter)
		.sort((a, b) => {
			const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
			if (statusDiff !== 0) return statusDiff;
			return dateValue(b.lastDate) - dateValue(a.lastDate);
		});

	return <>{renderGoalsContent({ isLoading, filtered, viewMode, onSelectGoal })}</>;
}
