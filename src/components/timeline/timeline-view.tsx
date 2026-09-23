"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityBlade, type ActivityBladeData } from "@/components/activities/activity-blade";
import { ActivityCard, type ActivityCardData } from "@/components/activities/activity-card";
import { ActivityRow } from "@/components/activities/activity-row";
import { CountUp } from "@/components/effects/count-up";
import { type ActivityWithJoins, useInfiniteActivities } from "@/hooks/use-activities";
import type { ActivityStatusValue } from "@/lib/validations/activity";

export function currentMonthKey() {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Whether an activity passes the timeline's status and type filters (an empty filter matches everything). */
export function matchesTimelineFilters(
	activity: ActivityWithJoins,
	statusFilter: ActivityStatusValue[],
	typeFilter: string[],
) {
	if (statusFilter.length > 0 && !statusFilter.includes(activity.status as ActivityStatusValue)) {
		return false;
	}
	if (typeFilter.length > 0 && !typeFilter.includes(activity.formatId)) {
		return false;
	}
	return true;
}

function TimelineContent({
	grouped,
	viewMode,
	setBladeActivityId,
	sentinelRef,
	isFetchingNextPage,
	currentMonthRef,
}: Readonly<{
	grouped: { key: string; label: string; items: ActivityCardData[] }[];
	viewMode: "grid" | "rows";
	setBladeActivityId: (id: string | null) => void;
	sentinelRef: React.RefObject<HTMLDivElement | null>;
	isFetchingNextPage: boolean;
	currentMonthRef: (node: HTMLDivElement | null) => void;
}>) {
	const thisMonth = currentMonthKey();

	return (
		<div className="relative mt-6">
			<div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-amber-300 via-stone-200 to-stone-100 dark:from-amber-700 dark:via-stone-800 dark:to-stone-900 sm:left-6" />

			{grouped.map((group) => {
				const isCurrentMonth = group.key === thisMonth;
				return (
					<div
						key={group.label}
						ref={isCurrentMonth ? currentMonthRef : undefined}
						className="mb-8 scroll-mt-20"
					>
						<div className="relative mb-3 flex items-center">
							<div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 ring-2 ring-amber-400 dark:bg-stone-800 dark:text-amber-300 dark:ring-amber-800 sm:h-12 sm:w-12 sm:text-sm">
								<CountUp to={group.items.length} from={0} duration={0.8} />
							</div>
							<h3 className="ml-4 text-lg font-semibold text-stone-800 dark:text-stone-100">
								{group.label}
							</h3>
							{isCurrentMonth && (
								<span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-amber-500/80 dark:text-amber-400/80">
									This month
								</span>
							)}
						</div>

						{viewMode === "rows" ? (
							<div className="ml-5 flex flex-col gap-0 divide-y divide-stone-100 border-l border-stone-100 pl-8 dark:divide-stone-800 dark:border-stone-800 sm:ml-6 sm:pl-10">
								{group.items.map((a, i) => (
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
											goalTitle: a.goalTitle,
										}}
										index={i}
										onClick={() => setBladeActivityId(a.id)}
									/>
								))}
							</div>
						) : (
							<div className="ml-5 grid grid-cols-1 gap-2 border-l border-stone-100 pl-8 dark:border-stone-800 sm:ml-6 sm:grid-cols-2 sm:pl-10">
								{group.items.map((a, i) => (
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
											goalTitle: a.goalTitle,
										}}
										index={i}
										onClick={() => setBladeActivityId(a.id)}
									/>
								))}
							</div>
						)}
					</div>
				);
			})}

			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage && (
				<div className="flex justify-center py-6">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
				</div>
			)}
		</div>
	);
}

export function TimelineView({
	yearFilter,
	statusFilter,
	typeFilter,
	viewMode,
	initialActivities,
}: Readonly<{
	yearFilter: "all" | number;
	statusFilter: ActivityStatusValue[];
	typeFilter: string[];
	viewMode: "grid" | "rows";
	initialActivities?: Parameters<typeof useInfiniteActivities>[1];
}>) {
	const filters = useMemo(() => {
		const f: Record<string, unknown> = { limit: 30 };
		if (yearFilter !== "all") {
			f.from = `${yearFilter}-01-01`;
			f.to = `${yearFilter}-12-31`;
		}
		return f;
	}, [yearFilter]);
	const isDefaultFilters = yearFilter === "all";
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteActivities(
		filters,
		isDefaultFilters ? initialActivities : undefined,
	);
	const [bladeActivityId, setBladeActivityId] = useState<string | null>(null);

	const allActivities = useMemo(() => {
		const activities = data?.pages.flatMap((p) => p.data) ?? [];
		return activities.filter((a) => matchesTimelineFilters(a, statusFilter, typeFilter));
	}, [data, statusFilter, typeFilter]);

	const grouped = useMemo(() => {
		if (allActivities.length === 0) return [];
		const groups = new Map<string, typeof allActivities>();
		for (const activity of allActivities) {
			const d = new Date(activity.fullDate);
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
			const existing = groups.get(key);
			if (existing) {
				existing.push(activity);
			} else {
				groups.set(key, [activity]);
			}
		}
		return Array.from(groups.entries()).map(([key, items]) => ({
			key,
			label: new Date(items[0].fullDate).toLocaleDateString("en-GB", {
				month: "long",
				year: "numeric",
			}),
			items,
		}));
	}, [allActivities]);

	const hasCurrentMonthGroup = useMemo(
		() => grouped.some((g) => g.key === currentMonthKey()),
		[grouped],
	);

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
					goalTitle: allActivities[bladeIdx].goalTitle,
					formatName: allActivities[bladeIdx].formatName,
					formatColor: allActivities[bladeIdx].formatColor,
				}
			: null;

	const sentinelRef = useRef<HTMLDivElement>(null);
	const currentMonthNodeRef = useRef<HTMLDivElement | null>(null);
	const currentMonthObserverRef = useRef<IntersectionObserver | null>(null);
	const [currentMonthOutOfView, setCurrentMonthOutOfView] = useState(false);

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

	// Drive the "jump to this month" pill without forcing a scroll.
	const currentMonthRef = useCallback((node: HTMLDivElement | null) => {
		currentMonthObserverRef.current?.disconnect();
		currentMonthNodeRef.current = node;
		if (!node) {
			setCurrentMonthOutOfView(false);
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => setCurrentMonthOutOfView(!entry.isIntersecting),
			{ rootMargin: "-72px 0px 0px 0px" },
		);
		observer.observe(node);
		currentMonthObserverRef.current = observer;
	}, []);

	useEffect(() => () => currentMonthObserverRef.current?.disconnect(), []);

	return (
		<>
			{isLoading && (
				<div className="mt-6 space-y-3">
					{["a", "b", "c", "d", "e"].map((id) => (
						<div
							key={`tl-skel-${id}`}
							className="h-20 animate-pulse rounded-lg border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900"
						/>
					))}
				</div>
			)}
			{!isLoading && grouped.length > 0 && (
				<TimelineContent
					grouped={grouped}
					viewMode={viewMode}
					setBladeActivityId={setBladeActivityId}
					sentinelRef={sentinelRef}
					isFetchingNextPage={isFetchingNextPage}
					currentMonthRef={currentMonthRef}
				/>
			)}
			{!isLoading && grouped.length === 0 && (
				<div className="mt-16 text-center text-stone-400 dark:text-stone-600">
					No activities found
				</div>
			)}

			{hasCurrentMonthGroup && currentMonthOutOfView && (
				<button
					type="button"
					onClick={() =>
						currentMonthNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
					}
					className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-amber-300 bg-white/95 px-4 py-2 text-sm font-medium text-amber-700 shadow-lg shadow-stone-900/10 backdrop-blur-sm transition-colors hover:bg-amber-50"
				>
					<svg
						className="h-3.5 w-3.5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2.5}
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="9" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
					</svg>
					Jump to this month
				</button>
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
