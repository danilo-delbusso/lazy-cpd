"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useEffect, useRef, useState } from "react";
import { usePublicLayout } from "@/app/(public)/public-layout-context";
import { cn } from "@/lib/utils/cn";
import type { ActivityStatusValue } from "@/lib/validations/activity";
import type { GoalStatus } from "@/lib/validations/goal";

const GOAL_STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "open", label: "Open" },
	{ value: "upcoming", label: "Upcoming" },
	{ value: "completed", label: "Completed" },
] as const;

const ACTIVITY_STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "upcoming", label: "Upcoming" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "completed", label: "Completed" },
] as const;

function useClickOutside(refs: React.RefObject<HTMLElement | null>[], handlers: (() => void)[]) {
	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			for (let i = 0; i < refs.length; i++) {
				const ref = refs[i];
				if (ref.current && !ref.current.contains(e.target as Node)) {
					handlers[i]();
				}
			}
		}
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
		// Stable refs and handlers — only mount/unmount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refs.length, refs, handlers]);
}

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

	useClickOutside([navRef, filterRef], [() => setNavOpen(false), () => setFilterOpen(false)]);

	const statusOptions = isGoals ? GOAL_STATUS_OPTIONS : ACTIVITY_STATUS_OPTIONS;
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
			<PageSelector
				ref={navRef}
				isGoals={isGoals}
				isTimeline={isTimeline}
				isOpen={navOpen}
				onToggle={() => {
					setNavOpen(!navOpen);
					setFilterOpen(false);
				}}
				onClose={() => setNavOpen(false)}
			/>
			<FilterDropdown
				ref={filterRef}
				isOpen={filterOpen}
				onToggle={() => {
					setFilterOpen(!filterOpen);
					setNavOpen(false);
				}}
				hasActiveFilter={!!hasActiveFilter}
				statusOptions={statusOptions}
				currentFilter={currentFilter}
				onFilterChange={setFilter}
				isTimeline={isTimeline}
				yearFilter={yearFilter}
				onYearChange={setYearFilter}
			/>
		</div>
	);
}

interface PageSelectorProps {
	isGoals: boolean;
	isTimeline: boolean;
	isOpen: boolean;
	onToggle: () => void;
	onClose: () => void;
}

const PageSelector = forwardRef<HTMLDivElement, PageSelectorProps>(function PageSelector(
	{ isGoals, isTimeline, isOpen, onToggle, onClose },
	ref,
) {
	const currentPage = isTimeline ? "Timeline" : "Goals";

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={onToggle}
				className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
			>
				{currentPage}
				<ChevronDown className={cn("transition-transform", isOpen && "rotate-180")} />
			</button>
			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
					<Link
						href="/"
						onClick={onClose}
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
						onClick={onClose}
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
	);
});

interface FilterDropdownProps {
	isOpen: boolean;
	onToggle: () => void;
	hasActiveFilter: boolean;
	statusOptions: readonly { readonly value: string; readonly label: string }[];
	currentFilter: string;
	onFilterChange: (v: string) => void;
	isTimeline: boolean;
	yearFilter: "all" | number;
	onYearChange: (v: "all" | number) => void;
}

const FilterDropdown = forwardRef<HTMLDivElement, FilterDropdownProps>(function FilterDropdown(
	{
		isOpen,
		onToggle,
		hasActiveFilter,
		statusOptions,
		currentFilter,
		onFilterChange,
		isTimeline,
		yearFilter,
		onYearChange,
	},
	ref,
) {
	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={onToggle}
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
			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-stone-200 bg-white p-3 shadow-lg">
					<StatusPills options={statusOptions} current={currentFilter} onChange={onFilterChange} />
					{isTimeline && (
						<>
							<p className="mb-2 mt-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
								Year
							</p>
							<YearPills value={yearFilter} onChange={onYearChange} />
						</>
					)}
				</div>
			)}
		</div>
	);
});

function StatusPills({
	options,
	current,
	onChange,
}: Readonly<{
	options: readonly { readonly value: string; readonly label: string }[];
	current: string;
	onChange: (v: string) => void;
}>) {
	return (
		<>
			<p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
				Status
			</p>
			<div className="flex flex-wrap gap-1">
				{options.map((o) => (
					<button
						key={o.value}
						type="button"
						onClick={() => onChange(o.value)}
						className={cn(
							"rounded-md px-2.5 py-1 text-xs font-medium transition-all",
							current === o.value
								? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
								: "bg-stone-50 text-stone-500 hover:bg-stone-100",
						)}
					>
						{o.label}
					</button>
				))}
			</div>
		</>
	);
}

function YearPills({
	value,
	onChange,
}: Readonly<{
	value: "all" | number;
	onChange: (v: "all" | number) => void;
}>) {
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

function ChevronDown({ className }: Readonly<{ className?: string }>) {
	return (
		<svg
			className={cn("h-3.5 w-3.5", className)}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2.5}
			aria-hidden="true"
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
		</svg>
	);
}

function FilterIcon() {
	return (
		<svg
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
			/>
		</svg>
	);
}
