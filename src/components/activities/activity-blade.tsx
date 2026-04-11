"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import { ActivityFormatBadge } from "@/components/activities/activity-format-badge";
import { ActivityStatusBadge } from "@/components/activities/activity-status-badge";
import { formatDate } from "@/lib/utils/dates";
import type { ActivityStatusValue } from "@/lib/validations/activity";

const MarkdownContent = dynamic(
	() => import("./markdown-content").then((m) => ({ default: m.MarkdownContent })),
	{ ssr: false },
);

export interface ActivityBladeData {
	id: string;
	title: string;
	fullDate: Date | string;
	status: string;
	notes?: string | null;
	references?: string | null;
	goalTitle?: string;
	formatName: string;
	formatColor: string;
}

interface ActivityBladeProps {
	activity: ActivityBladeData | null;
	onClose: () => void;
	/** Navigate to previous/next activity */
	onPrev?: () => void;
	onNext?: () => void;
}

export function ActivityBlade({ activity, onClose, onPrev, onNext }: ActivityBladeProps) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowUp" || e.key === "ArrowLeft") onPrev?.();
			if (e.key === "ArrowDown" || e.key === "ArrowRight") onNext?.();
		},
		[onClose, onPrev, onNext],
	);

	useEffect(() => {
		if (!activity) return;
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activity, handleKeyDown]);

	return (
		<AnimatePresence>
			{activity && (
				<>
					{/* Backdrop */}
					<motion.div
						key="blade-backdrop"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
						onClick={onClose}
					/>

					{/* Panel */}
					<motion.aside
						key="blade-panel"
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", stiffness: 400, damping: 35 }}
						className="fixed top-0 right-0 z-50 flex h-full w-1/2 min-w-[300px] flex-col border-l border-stone-200 bg-white shadow-2xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
							<div className="flex items-center gap-2">
								{onPrev && (
									<button
										type="button"
										onClick={onPrev}
										className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
										aria-label="Previous activity"
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
									</button>
								)}
								{onNext && (
									<button
										type="button"
										onClick={onNext}
										className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
										aria-label="Next activity"
									>
										<svg
											className="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
										</svg>
									</button>
								)}
							</div>
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
								aria-label="Close"
							>
								<svg
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Body */}
						<div className="flex-1 overflow-y-auto px-6 py-6">
							{/* Status + Format + Date row */}
							<div className="flex flex-wrap items-center gap-2">
								<ActivityStatusBadge status={activity.status as ActivityStatusValue} />
								<ActivityFormatBadge name={activity.formatName} color={activity.formatColor} />
							</div>

							<h2 className="mt-4 text-xl font-bold text-stone-900">{activity.title}</h2>

							{activity.goalTitle && (
								<p className="mt-1 text-sm font-medium text-amber-600">{activity.goalTitle}</p>
							)}

							<p className="mt-2 text-sm text-stone-400">{formatDate(activity.fullDate)}</p>

							{/* Notes */}
							{activity.notes && (
								<div className="mt-6">
									<h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
										Notes
									</h3>
									<div className="prose prose-sm prose-stone mt-2 max-w-none">
										<MarkdownContent>{activity.notes}</MarkdownContent>
									</div>
								</div>
							)}

							{/* References */}
							{activity.references && (
								<div className="mt-6">
									<h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
										References
									</h3>
									<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
										{activity.references}
									</p>
								</div>
							)}

							{/* Empty state for activities with no notes or references */}
							{!activity.notes && !activity.references && (
								<div className="mt-8 text-center">
									<p className="text-sm text-stone-300">No additional details recorded</p>
								</div>
							)}
						</div>

						{/* Footer with keyboard hints */}
						<div className="border-t border-stone-100 px-6 py-3">
							<div className="flex items-center justify-center gap-4 text-[11px] text-stone-400">
								<span>
									<kbd className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-500">
										←
									</kbd>{" "}
									<kbd className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-500">
										→
									</kbd>{" "}
									navigate
								</span>
								<span>
									<kbd className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-500">
										esc
									</kbd>{" "}
									close
								</span>
							</div>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
