"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/ui-store";

interface SearchableItem {
	id: string;
	title: string;
	subtitle?: string;
	href: string;
	type: "page" | "goal" | "activity";
}

const staticPages: SearchableItem[] = [
	{ id: "home", title: "Home", href: "/", type: "page" },
	{ id: "goals", title: "Goals", subtitle: "View all CPD goals", href: "/goals", type: "page" },
	{
		id: "timeline",
		title: "Timeline",
		subtitle: "Activity timeline",
		href: "/timeline",
		type: "page",
	},
	{ id: "admin", title: "Admin Dashboard", href: "/admin", type: "page" },
];

export function CommandPalette() {
	const open = useUIStore((s) => s.commandPaletteOpen);
	const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Fetch goals for search
	const { data: goals } = useQuery<{ id: string; title: string; description: string }[]>({
		queryKey: ["goals-search"],
		queryFn: async () => {
			const res = await fetch("/api/goals");
			if (!res.ok) return [];
			const data = await res.json();
			return data.map((g: { id: string; title: string; description: string }) => ({
				id: g.id,
				title: g.title,
				description: g.description,
			}));
		},
		enabled: open,
		staleTime: 30_000,
	});

	const goalItems: SearchableItem[] = useMemo(
		() =>
			(goals ?? []).map((g) => ({
				id: g.id,
				title: g.title,
				subtitle: g.description.slice(0, 80),
				href: `/goal/${g.id}`,
				type: "goal" as const,
			})),
		[goals],
	);

	const allItems = useMemo(() => [...staticPages, ...goalItems], [goalItems]);

	const filtered = useMemo(() => {
		if (!query.trim()) return allItems.slice(0, 10);
		const lower = query.toLowerCase();
		return allItems
			.filter(
				(item) =>
					item.title.toLowerCase().includes(lower) || item.subtitle?.toLowerCase().includes(lower),
			)
			.slice(0, 10);
	}, [query, allItems]);

	// Reset on open/close
	useEffect(() => {
		if (open) {
			setQuery("");
			setSelectedIndex(0);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [open]);

	// Reset selection when results change
	useEffect(() => {
		setSelectedIndex(0);
	}, [filtered.length]);

	function navigate(item: SearchableItem) {
		setOpen(false);
		router.push(item.href);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter" && filtered[selectedIndex]) {
			navigate(filtered[selectedIndex]);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	}

	const typeIcons: Record<string, string> = {
		page: "P",
		goal: "G",
		activity: "A",
	};

	return (
		<AnimatePresence>
			{open && (
				<div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/30 backdrop-blur-sm"
						onClick={() => setOpen(false)}
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl"
					>
						{/* Search input */}
						<div className="flex items-center border-b border-stone-200 px-4">
							<svg
								className="h-5 w-5 text-stone-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<input
								ref={inputRef}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Search goals, pages..."
								className="w-full px-3 py-4 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
							/>
							<kbd className="rounded border border-stone-200 px-1.5 py-0.5 font-mono text-xs text-stone-400">
								esc
							</kbd>
						</div>

						{/* Results */}
						<div className="max-h-80 overflow-y-auto py-2">
							{filtered.length === 0 && (
								<p className="px-4 py-8 text-center text-sm text-stone-400">No results found</p>
							)}
							{filtered.map((item, i) => (
								<button
									type="button"
									key={item.id}
									onClick={() => navigate(item)}
									onMouseEnter={() => setSelectedIndex(i)}
									className={cn(
										"flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
										i === selectedIndex
											? "bg-amber-50 text-amber-900"
											: "text-stone-600 hover:bg-stone-50",
									)}
								>
									<span
										className={cn(
											"flex h-6 w-6 items-center justify-center rounded text-xs font-semibold",
											item.type === "goal"
												? "bg-amber-100 text-amber-700"
												: "bg-stone-100 text-stone-500",
										)}
									>
										{typeIcons[item.type]}
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{item.title}</p>
										{item.subtitle && (
											<p className="truncate text-xs text-stone-400">{item.subtitle}</p>
										)}
									</div>
								</button>
							))}
						</div>

						{/* Footer hint */}
						<div className="flex gap-4 border-t border-stone-200 px-4 py-2 text-xs text-stone-400">
							<span>
								<kbd className="font-mono">↑↓</kbd> navigate
							</span>
							<span>
								<kbd className="font-mono">↵</kbd> select
							</span>
							<span>
								<kbd className="font-mono">esc</kbd> close
							</span>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
