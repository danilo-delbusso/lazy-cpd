"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGoals } from "@/hooks/use-goals";
import { cn } from "@/lib/utils/cn";

export function YearSelector({
	value,
	onChange,
}: Readonly<{
	value: "all" | number;
	onChange: (v: "all" | number) => void;
}>) {
	const { data: goals } = useGoals();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const years = useMemo(() => {
		if (!goals) return [];
		const yearSet = new Set<number>();
		for (const g of goals) {
			if (g.firstDate) yearSet.add(new Date(g.firstDate).getFullYear());
			if (g.lastDate) yearSet.add(new Date(g.lastDate).getFullYear());
		}
		return Array.from(yearSet).sort((a, b) => b - a);
	}, [goals]);

	const options: { value: "all" | number; label: string }[] = [
		{ value: "all", label: "All Years" },
		...years.map((y) => ({ value: y, label: String(y) })),
	];

	const selectedLabel = options.find((o) => o.value === value)?.label ?? "All Years";

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	// Close on Escape
	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open]);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={cn(
					"flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all",
					open
						? "border-amber-300 bg-amber-50/50 text-amber-700 shadow-sm"
						: "border-stone-200 bg-white text-stone-600 hover:border-amber-300 hover:text-amber-700",
				)}
			>
				<svg
					className="h-3.5 w-3.5 text-amber-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				{selectedLabel}
				<motion.svg
					animate={{ rotate: open ? 180 : 0 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
					className="h-3.5 w-3.5 text-stone-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
				</motion.svg>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -4, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -4, scale: 0.97 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="absolute right-0 z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-stone-200 bg-white/95 py-1 shadow-lg shadow-stone-200/50 backdrop-blur-xl"
					>
						{options.map((option, i) => (
							<motion.button
								key={String(option.value)}
								type="button"
								initial={{ opacity: 0, x: -8 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: i * 0.03, duration: 0.15 }}
								onClick={() => {
									onChange(option.value);
									setOpen(false);
								}}
								className={cn(
									"flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm transition-colors",
									option.value === value
										? "bg-amber-50 font-medium text-amber-700"
										: "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
								)}
							>
								<span
									className={cn(
										"flex h-4 w-4 items-center justify-center rounded-full border transition-all",
										option.value === value ? "border-amber-400 bg-amber-400" : "border-stone-300",
									)}
								>
									{option.value === value && (
										<motion.svg
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{
												type: "spring",
												stiffness: 500,
												damping: 25,
											}}
											className="h-2.5 w-2.5 text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={3}
										>
											<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
										</motion.svg>
									)}
								</span>
								{option.label}
							</motion.button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
