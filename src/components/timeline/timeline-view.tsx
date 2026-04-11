"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityBlade, type ActivityBladeData } from "@/components/activities/activity-blade";
import { ActivityCard, type ActivityCardData } from "@/components/activities/activity-card";
import { ActivityRow } from "@/components/activities/activity-row";
import { CountUp } from "@/components/effects/count-up";
import { useInfiniteActivities } from "@/hooks/use-activities";
import type { ActivityStatusValue } from "@/lib/validations/activity";

function TimelineContent({
	grouped,
	viewMode,
	setBladeActivityId,
	sentinelRef,
	isFetchingNextPage,
}: Readonly<{
	grouped: { label: string; items: ActivityCardData[] }[];
	viewMode: "grid" | "rows";
	setBladeActivityId: (id: string | null) => void;
	sentinelRef: React.RefObject<HTMLDivElement | null>;
	isFetchingNextPage: boolean;
}>) {
	return (
		<div className="relative mt-6">
			<div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-amber-300 via-stone-200 to-stone-100 sm:left-6" />

			{grouped.map((group) => (
				<div key={group.label} className="mb-8">
					<div className="relative mb-3 flex items-center">
						<div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 ring-2 ring-amber-300 sm:h-12 sm:w-12 sm:text-sm">
							<CountUp to={group.items.length} from={0} duration={0.8} />
						</div>
						<h3 className="ml-4 text-lg font-semibold text-stone-800">{group.label}</h3>
					</div>

					{viewMode === "rows" ? (
						<div className="ml-5 flex flex-col gap-0 divide-y divide-stone-100 border-l border-stone-100 pl-8 sm:ml-6 sm:pl-10">
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
						<div className="ml-5 grid grid-cols-1 gap-2 border-l border-stone-100 pl-8 sm:ml-6 sm:grid-cols-2 sm:pl-10">
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
			))}

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
	activityFilter,
	viewMode,
	initialActivities,
}: Readonly<{
	yearFilter: "all" | number;
	activityFilter: ActivityStatusValue | "all";
	viewMode: "grid" | "rows";
	initialActivities?: Parameters<typeof useInfiniteActivities>[1];
}>) {
	const filters = useMemo(() => {
		const f: Record<string, unknown> = { limit: 30 };
		if (yearFilter !== "all") {
			f.from = `${yearFilter}-01-01`;
			f.to = `${yearFilter}-12-31`;
		}
		if (activityFilter !== "all") {
			f.status = activityFilter;
		}
		return f;
	}, [yearFilter, activityFilter]);
	const isDefaultFilters = yearFilter === "all" && activityFilter === "all";
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteActivities(
		filters,
		isDefaultFilters ? initialActivities : undefined,
	);
	const [bladeActivityId, setBladeActivityId] = useState<string | null>(null);

	const allActivities = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

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
		return Array.from(groups.entries()).map(([, items]) => ({
			label: new Date(items[0].fullDate).toLocaleDateString("en-GB", {
				month: "long",
				year: "numeric",
			}),
			items,
		}));
	}, [allActivities]);

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

	return (
		<>
			{isLoading && (
				<div className="mt-6 space-y-3">
					{["a", "b", "c", "d", "e"].map((id) => (
						<div
							key={`tl-skel-${id}`}
							className="h-20 animate-pulse rounded-lg border border-stone-200 bg-stone-50"
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
				/>
			)}
			{!isLoading && grouped.length === 0 && (
				<div className="mt-16 text-center text-stone-400">No activities found</div>
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
