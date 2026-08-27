"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface MultiSelectOption {
	value: string;
	label: string;
	swatch?: string;
}

interface MultiSelectFilterProps {
	label: string;
	options: MultiSelectOption[];
	selected: string[];
	onChange: (values: string[]) => void;
	icon?: React.ReactNode;
}

export function MultiSelectFilter({
	label,
	options,
	selected,
	onChange,
	icon,
}: Readonly<MultiSelectFilterProps>) {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const ref = useRef<HTMLDivElement>(null);
	const listId = useId();

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	const toggle = useCallback(
		(value: string) => {
			onChange(
				selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
			);
		},
		[selected, onChange],
	);

	const moveActive = useCallback(
		(delta: number) => {
			setActiveIndex((i) => Math.min(Math.max(i + delta, 0), options.length - 1));
		},
		[options.length],
	);

	const activateOption = useCallback(() => {
		const opt = options[activeIndex];
		if (opt) toggle(opt.value);
	}, [options, activeIndex, toggle]);

	useEffect(() => {
		if (!open) return;
		const keyActions: Record<string, (e: KeyboardEvent) => void> = {
			Escape: () => setOpen(false),
			ArrowDown: (e) => {
				e.preventDefault();
				moveActive(1);
			},
			ArrowUp: (e) => {
				e.preventDefault();
				moveActive(-1);
			},
			Enter: (e) => {
				e.preventDefault();
				activateOption();
			},
			" ": (e) => {
				e.preventDefault();
				activateOption();
			},
		};
		const handler = (e: KeyboardEvent) => keyActions[e.key]?.(e);
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open, moveActive, activateOption]);

	const count = selected.length;

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => {
					setOpen((o) => !o);
					setActiveIndex(0);
				}}
				aria-expanded={open}
				aria-haspopup="listbox"
				className={cn(
					"flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
					count > 0 || open
						? "border-amber-300 bg-amber-50/50 text-amber-700 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300"
						: "border-stone-200 bg-white text-stone-500 hover:border-amber-300 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-amber-600 dark:hover:text-amber-400",
				)}
			>
				{icon}
				{label}
				{count > 0 && (
					<span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white dark:bg-amber-600">
						{count}
					</span>
				)}
				<motion.svg
					animate={{ rotate: open ? 180 : 0 }}
					transition={{ duration: 0.15, ease: "easeInOut" }}
					className="h-3 w-3 text-stone-400 dark:text-stone-500"
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
						id={listId}
						role="listbox"
						aria-multiselectable="true"
						initial={{ opacity: 0, y: -4, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -4, scale: 0.97 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="absolute left-0 z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-stone-200 bg-white/95 py-1 shadow-lg shadow-stone-200/50 backdrop-blur-xl dark:border-stone-700 dark:bg-stone-900/95 dark:shadow-black/40"
					>
						{options.map((option, i) => {
							const isSelected = selected.includes(option.value);
							return (
								<button
									key={option.value}
									type="button"
									role="option"
									aria-selected={isSelected}
									onMouseEnter={() => setActiveIndex(i)}
									onClick={() => toggle(option.value)}
									className={cn(
										"flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm transition-colors",
										i === activeIndex && "bg-stone-50 dark:bg-stone-800",
										isSelected
											? "font-medium text-amber-700 dark:text-amber-400"
											: "text-stone-600 dark:text-stone-300",
									)}
								>
									<span
										className={cn(
											"flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
											isSelected
												? "border-amber-400 bg-amber-400 dark:border-amber-500 dark:bg-amber-500"
												: "border-stone-300 dark:border-stone-600",
										)}
									>
										{isSelected && (
											<svg
												className="h-2.5 w-2.5 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={3}
												aria-hidden="true"
											>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										)}
									</span>
									{option.swatch && (
										<span
											className="h-2 w-2 shrink-0 rounded-full"
											style={{ backgroundColor: option.swatch }}
										/>
									)}
									{option.label}
								</button>
							);
						})}
						{count > 0 && (
							<>
								<div className="my-1 border-t border-stone-100 dark:border-stone-800" />
								<button
									type="button"
									onClick={() => onChange([])}
									className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
								>
									Clear
								</button>
							</>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
