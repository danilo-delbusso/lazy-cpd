"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityBlade, type ActivityBladeData } from "@/components/activities/activity-blade";
import { ActivityCard } from "@/components/activities/activity-card";
import { ActivityRow } from "@/components/activities/activity-row";
import { GoalStatusBadge } from "@/components/goals/goal-status-badge";
import { StatChip } from "@/components/ui/stat-chip";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useInfiniteActivities } from "@/hooks/use-activities";
import { useGoal } from "@/hooks/use-goals";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";
import type { GoalStatus } from "@/lib/validations/goal";
import { useUIStore } from "@/stores/ui-store";

export function GoalDetailView({
	goalId,
	onBack,
	viewMode,
	initialGoal,
	initialActivities,
}: {
	goalId: string;
	onBack: () => void;
	viewMode: "grid" | "rows";
	initialGoal?: Parameters<typeof useGoal>[1];
	initialActivities?: Parameters<typeof useInfiniteActivities>[1];
}) {
	const { data: goal, isLoading: goalLoading } = useGoal(goalId, initialGoal);
	const {
		data,
		isLoading: activitiesLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteActivities({ goalId, limit: 30 }, initialActivities);
	const [bladeActivityId, setBladeActivityId] = useState<string | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const allActivities = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

	const stats = useMemo(
		() => ({
			upcoming: goal?.activities.filter((a) => a.status === "upcoming").length ?? 0,
			inProgress: goal?.activities.filter((a) => a.status === "in_progress").length ?? 0,
			completed: goal?.activities.filter((a) => a.status === "completed").length ?? 0,
		}),
		[goal],
	);

	const dates = useMemo(() => {
		const sorted = goal?.activities.map((a) => a.fullDate).sort() ?? [];
		return {
			first: sorted[0] ?? null,
			last: sorted[sorted.length - 1] ?? null,
		};
	}, [goal]);

	const bladeIdx = bladeActivityId ? allActivities.findIndex((a) => a.id === bladeActivityId) : -1;
	const bladeActivity: ActivityBladeData | null =
		bladeIdx >= 0
			? {
					id: allActivities[bladeIdx].id,
					title: allActivities[bladeIdx].title,
					fullDate: allActivities[bladeIdx].fullDate,
					status: allActivities[bladeIdx].status,
					notes: allActivities[bladeIdx].notes,
					references: allActivities[bladeIdx].references,
					goalTitle: goal?.title,
					formatName: allActivities[bladeIdx].formatName,
					formatColor: allActivities[bladeIdx].formatColor,
				}
			: null;

	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const isLoading = goalLoading || activitiesLoading;
	if (isLoading)
		return (
			<div className="flex justify-center py-24">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
			</div>
		);
	if (!goal) return <div className="py-24 text-center text-stone-400">Goal not found</div>;

	return (
		<>
			<button
				type="button"
				onClick={onBack}
				className="mb-4 flex items-center gap-1 text-sm text-stone-400 transition hover:text-amber-600"
			>
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
				Back to goals
			</button>

			<div
				className={cn(
					"rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6",
					goal.status === "open"
						? "border-green-200"
						: goal.status === "completed"
							? "border-sky-200"
							: "border-stone-200",
				)}
			>
				<div>
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="text-xl font-bold text-stone-900 sm:text-2xl">{goal.title}</h2>
						<GoalStatusBadge status={goal.status as GoalStatus} />
					</div>
					{dates.first && (
						<p className="mt-1 text-xs text-stone-400">
							{formatDate(dates.first)}
							{dates.last && dates.last !== dates.first && <span> — {formatDate(dates.last)}</span>}
						</p>
					)}
					<p className="mt-2 text-sm text-stone-600 sm:text-base">{goal.description}</p>
				</div>

				{goal.tags.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-1.5">
						{goal.tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-yellow-200"
							>
								{tag}
							</span>
						))}
					</div>
				)}

				{/* Progress bar */}
				{goal.activities.length > 0 && (
					<div className="mt-4 flex items-center gap-3">
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
							<div
								className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
								style={{
									width: `${Math.round((stats.completed / goal.activities.length) * 100)}%`,
								}}
							/>
						</div>
						<span className="text-xs font-medium tabular-nums text-stone-500">
							{Math.round((stats.completed / goal.activities.length) * 100)}%
						</span>
					</div>
				)}

				<div className="mt-4 flex gap-3">
					<StatChip label="Upcoming" value={stats.upcoming} cls="text-orange-600 bg-orange-50" />
					<StatChip label="In Progress" value={stats.inProgress} cls="text-sky-600 bg-sky-50" />
					<StatChip label="Done" value={stats.completed} cls="text-emerald-600 bg-emerald-50" />
				</div>
			</div>

			<div className="mt-4 flex items-center justify-between">
				<p className="text-sm text-stone-400">
					{allActivities.length} {allActivities.length === 1 ? "activity" : "activities"}
				</p>
				<div className="hidden sm:block">
					<ViewToggle mode={viewMode} onChange={(m) => useUIStore.getState().setViewMode(m)} />
				</div>
			</div>

			{viewMode === "rows" ? (
				<div className="mt-2 flex flex-col gap-0 divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white/80 shadow-sm">
					{allActivities.map((a, i) => (
						<ActivityRow
							key={a.id}
							activity={{
								id: a.id,
								title: a.title,
								fullDate: a.fullDate,
								status: a.status,
								notes: a.notes,
								tags: a.tags,
								formatName: a.formatName,
								formatColor: a.formatColor,
							}}
							index={i}
							onClick={() => setBladeActivityId(a.id)}
							showGoalTitle={false}
						/>
					))}
				</div>
			) : (
				<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
					{allActivities.map((a, i) => (
						<ActivityCard
							key={a.id}
							activity={{
								id: a.id,
								title: a.title,
								fullDate: a.fullDate,
								status: a.status,
								notes: a.notes,
								tags: a.tags,
								formatName: a.formatName,
								formatColor: a.formatColor,
							}}
							index={i}
							onClick={() => setBladeActivityId(a.id)}
							showGoalTitle={false}
						/>
					))}
				</div>
			)}

			{/* Infinite scroll sentinel */}
			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage && (
				<div className="flex justify-center py-6">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
				</div>
			)}

			<ActivityBlade
				activity={bladeActivity}
				onClose={() => setBladeActivityId(null)}
				onPrev={bladeIdx > 0 ? () => setBladeActivityId(allActivities[bladeIdx - 1].id) : undefined}
				onNext={
					bladeIdx >= 0 && bladeIdx < allActivities.length - 1
						? () => setBladeActivityId(allActivities[bladeIdx + 1].id)
						: undefined
				}
			/>
		</>
	);
}
