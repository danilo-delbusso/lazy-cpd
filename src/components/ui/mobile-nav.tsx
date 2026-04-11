"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePublicLayout } from "@/app/(public)/public-layout-context";
import { cn } from "@/lib/utils/cn";
import type { ActivityStatusValue } from "@/lib/validations/activity";
import type { GoalStatus } from "@/lib/validations/goal";

export function MobileNav() {
	const pathname = usePathname();
	const {
		goalFilter,
		setGoalFilter,
		yearFilter,
		setYearFilter,
		activityFilter,
		setActivityFilter,
	} = usePublicLayout();
	const [navOpen, setNavOpen] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const navRef = useRef<HTMLDivElement>(null);
	const filterRef = useRef<HTMLDivElement>(null);

	const isGoals = pathname === "/" || pathname.startsWith("/goal/");
	const isTimeline = pathname === "/timeline";
	const currentPage = isTimeline ? "Timeline" : "Goals";

	// Close on outside click
	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			if (navRef.current && !navRef.current.contains(e.target as Node)) setNavOpen(false);
			if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
		}
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, []);

	const statusOptions = isGoals
		? ([
				{ value: "all", label: "All" },
				{ value: "open", label: "Open" },
				{ value: "upcoming", label: "Upcoming" },
				{ value: "completed", label: "Completed" },
			] as const)
		: ([
				{ value: "all", label: "All" },
				{ value: "upcoming", label: "Upcoming" },
				{ value: "in_progress", label: "In Progress" },
				{ value: "completed", label: "Completed" },
			] as const);

	const currentFilter = isGoals ? goalFilter : activityFilter;
	const setFilter = isGoals
		? (v: string) => setGoalFilter(v as GoalStatus | "all")
		: (v: string) => setActivityFilter(v as ActivityStatusValue | "all");

	const activeFilterLabel =
		currentFilter === "all" ? null : statusOptions.find((o) => o.value === currentFilter)?.label;
	const activeYearLabel = isTimeline && yearFilter !== "all" ? String(yearFilter) : null;
	const hasActiveFilter = activeFilterLabel || activeYearLabel;

	return (
		<div className="flex items-center gap-1.5">
			{/* Page selector */}
			<div ref={navRef} className="relative">
				<button
					type="button"
					onClick={() => {
						setNavOpen(!navOpen);
						setFilterOpen(false);
					}}
					className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
				>
					{currentPage}
					<ChevronDown className={cn("transition-transform", navOpen && "rotate-180")} />
				</button>
				{navOpen && (
					<div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
						<Link
							href="/"
							onClick={() => setNavOpen(false)}
							className={cn(
								"block px-4 py-2 text-sm transition-colors",
								isGoals
									? "font-medium text-amber-700 bg-amber-50"
									: "text-stone-600 hover:bg-stone-50",
							)}
						>
							Goals
						</Link>
						<Link
							href="/timeline"
							onClick={() => setNavOpen(false)}
							className={cn(
								"block px-4 py-2 text-sm transition-colors",
								isTimeline
									? "font-medium text-amber-700 bg-amber-50"
									: "text-stone-600 hover:bg-stone-50",
							)}
						>
							Timeline
						</Link>
					</div>
				)}
			</div>

			{/* Filter dropdown */}
			<div ref={filterRef} className="relative">
				<button
					type="button"
					onClick={() => {
						setFilterOpen(!filterOpen);
						setNavOpen(false);
					}}
					className={cn(
						"flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
						hasActiveFilter
							? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
							: "text-stone-500 hover:bg-stone-100",
					)}
				>
					<FilterIcon />
					{hasActiveFilter && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
				</button>
				{filterOpen && (
					<div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-stone-200 bg-white p-3 shadow-lg">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
							Status
						</p>
						<div className="flex flex-wrap gap-1">
							{statusOptions.map((o) => (
								<button
									key={o.value}
									type="button"
									onClick={() => setFilter(o.value)}
									className={cn(
										"rounded-md px-2.5 py-1 text-xs font-medium transition-all",
										currentFilter === o.value
											? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
											: "bg-stone-50 text-stone-500 hover:bg-stone-100",
									)}
								>
									{o.label}
								</button>
							))}
						</div>

						{isTimeline && (
							<>
								<p className="mb-2 mt-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
									Year
								</p>
								<YearPills value={yearFilter} onChange={(y) => setYearFilter(y)} />
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function YearPills({
	value,
	onChange,
}: {
	value: "all" | number;
	onChange: (v: "all" | number) => void;
}) {
	// Derive year range — show current year and 3 years back
	const currentYear = new Date().getFullYear();
	const years: ("all" | number)[] = [
		"all",
		currentYear,
		currentYear - 1,
		currentYear - 2,
		currentYear - 3,
	];

	return (
		<div className="flex flex-wrap gap-1">
			{years.map((y) => (
				<button
					key={String(y)}
					type="button"
					onClick={() => onChange(y)}
					className={cn(
						"rounded-md px-2.5 py-1 text-xs font-medium transition-all",
						value === y
							? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
							: "bg-stone-50 text-stone-500 hover:bg-stone-100",
					)}
				>
					{y === "all" ? "All" : y}
				</button>
			))}
		</div>
	);
}

function ChevronDown({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-3.5 w-3.5", className)}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2.5}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
		</svg>
	);
}

function FilterIcon() {
	return (
		<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
			/>
		</svg>
	);
}
