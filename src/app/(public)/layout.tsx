"use client";

import { LayoutGroup } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DecryptedText } from "@/components/effects/decrypted-text";
import { DotGrid } from "@/components/effects/dot-grid";
import { GradientText } from "@/components/effects/gradient-text";
import { MobileNav } from "@/components/ui/mobile-nav";
import { TabButton } from "@/components/ui/tab-button";
import { ViewToggle } from "@/components/ui/view-toggle";
import { YearSelector } from "@/components/ui/year-selector";
import { cn } from "@/lib/utils/cn";
import type { ActivityStatusValue } from "@/lib/validations/activity";
import type { GoalStatus } from "@/lib/validations/goal";
import { useUIStore } from "@/stores/ui-store";
import { PublicLayoutProvider, usePublicLayout } from "./public-layout-context";

function DesktopFilterPills() {
	const pathname = usePathname();
	const {
		goalFilter,
		setGoalFilter,
		yearFilter,
		setYearFilter,
		activityFilter,
		setActivityFilter,
	} = usePublicLayout();

	const isGoalsRoot = pathname === "/";
	const isTimeline = pathname === "/timeline";

	const filterOptions = isGoalsRoot
		? ([
				{ value: "all", label: "All" },
				{ value: "open", label: "Open" },
				{ value: "upcoming", label: "Upcoming" },
				{ value: "completed", label: "Completed" },
			] as const)
		: isTimeline
			? ([
					{ value: "all", label: "All" },
					{ value: "upcoming", label: "Upcoming" },
					{ value: "in_progress", label: "In Progress" },
					{ value: "completed", label: "Completed" },
				] as const)
			: null;

	if (!filterOptions) return null;

	const currentFilter = isGoalsRoot ? goalFilter : activityFilter;
	const setFilter = isGoalsRoot
		? (v: string) => setGoalFilter(v as GoalStatus | "all")
		: (v: string) => setActivityFilter(v as ActivityStatusValue | "all");

	return (
		<div className="flex items-center gap-2">
			<div className="flex gap-1 rounded-lg bg-stone-100 p-1">
				{filterOptions.map((f) => (
					<button
						key={f.value}
						type="button"
						onClick={() => setFilter(f.value)}
						className={cn(
							"shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
							currentFilter === f.value
								? "bg-white text-amber-700 shadow-sm ring-1 ring-stone-200/60"
								: "text-stone-400 hover:text-stone-600",
						)}
					>
						{f.label}
					</button>
				))}
			</div>
			{isTimeline && <YearSelector value={yearFilter} onChange={setYearFilter} />}
		</div>
	);
}

function PublicLayoutInner({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
	const viewMode = useUIStore((s) => s.viewMode);
	const setViewMode = useUIStore((s) => s.setViewMode);

	const isGoalsTab = pathname === "/" || pathname.startsWith("/goal/");
	const isTimelineTab = pathname === "/timeline";

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setCommandPaletteOpen(true);
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [setCommandPaletteOpen]);

	return (
		<div className="relative min-h-screen">
			{/* Dot grid background — hidden on mobile for performance */}
			<div className="fixed inset-0 z-0 hidden sm:block">
				<DotGrid
					dotSize={10}
					gap={10}
					baseColor="#fafafa"
					activeColor="#fde68a"
					proximity={50}
					speedTrigger={50}
					shockRadius={80}
					shockStrength={5}
					stiffness={0.001}
					dampening={0.06}
					className="h-full w-full"
				/>
			</div>

			{/* Content above background */}
			<div className="relative z-10">
				{/* Mobile header */}
				<header className="sticky top-0 z-30 border-b border-stone-200/40 bg-white/80 backdrop-blur-sm sm:hidden">
					<div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
						<h1 className="text-base font-bold text-stone-900">
							<GradientText
								colors={["#d97706", "#b45309", "#92400e", "#d97706"]}
								animationSpeed={6}
								className="font-bold"
							>
								CPD
							</GradientText>
							<span className="ml-1 font-semibold text-stone-600">Portal</span>
						</h1>
						<MobileNav />
					</div>
				</header>

				{/* Desktop header */}
				<header className="hidden border-b border-stone-200/40 bg-white/55 backdrop-blur-[1px] sm:block">
					<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
						<div className="flex items-center gap-3">
							<h1 className="text-lg font-bold text-stone-900">
								<GradientText
									colors={["#d97706", "#b45309", "#92400e", "#d97706"]}
									animationSpeed={6}
									className="font-bold"
								>
									CPD
								</GradientText>
								<span className="ml-1.5 font-semibold text-stone-600">Portal</span>
							</h1>
							{process.env.NEXT_PUBLIC_SITE_OWNER && (
								<DecryptedText
									text={process.env.NEXT_PUBLIC_SITE_OWNER}
									animateOn="view"
									sequential
									revealDirection="start"
									speed={40}
									className="text-xs text-stone-400"
									encryptedClassName="text-xs text-stone-300"
								/>
							)}
						</div>
						<div className="flex items-center gap-3">
							{process.env.NEXT_PUBLIC_GITHUB_URL && (
								<a
									href={process.env.NEXT_PUBLIC_GITHUB_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="text-stone-400 transition-colors hover:text-stone-600"
									aria-label="GitHub"
								>
									<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
										<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
									</svg>
								</a>
							)}
							{process.env.NEXT_PUBLIC_LINKEDIN_URL && (
								<a
									href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="text-stone-400 transition-colors hover:text-stone-600"
									aria-label="LinkedIn"
								>
									<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
									</svg>
								</a>
							)}
						</div>
					</div>
				</header>

				{/* Desktop navigation bar */}
				<div className="relative z-20 hidden border-b border-stone-200/40 bg-white/55 backdrop-blur-[1px] sm:block">
					<div className="mx-auto flex max-w-6xl items-center justify-between px-6">
						<LayoutGroup>
							<div className="flex items-center">
								<TabButton href="/" active={isGoalsTab}>
									Goals
								</TabButton>
								<TabButton href="/timeline" active={isTimelineTab}>
									Timeline
								</TabButton>
							</div>
						</LayoutGroup>
						<div className="flex items-center gap-2">
							<DesktopFilterPills />
							<ViewToggle mode={viewMode} onChange={(m) => setViewMode(m)} />
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">{children}</div>

				{/* Footer */}
				<footer className="mt-8 border-t border-stone-100 py-6 text-center text-xs text-stone-400">
					<DecryptedText
						text="Built by Ricky Stevens"
						animateOn="view"
						sequential
						revealDirection="center"
						speed={30}
						className="text-stone-400"
						encryptedClassName="text-stone-300"
					/>
				</footer>
			</div>
		</div>
	);
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<PublicLayoutProvider>
			<PublicLayoutInner>{children}</PublicLayoutInner>
		</PublicLayoutProvider>
	);
}
