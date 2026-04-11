"use client";

import { cn } from "@/lib/utils/cn";

interface ViewToggleProps {
	mode: "grid" | "rows";
	onChange: (mode: "grid" | "rows") => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
	return (
		<div className="flex gap-1 rounded-lg bg-stone-100 p-1">
			<button
				type="button"
				onClick={() => onChange("grid")}
				className={cn(
					"rounded-md p-1.5 transition-all",
					mode === "grid" ? "bg-white shadow-sm ring-1 ring-stone-200/60" : "hover:bg-stone-50",
				)}
				aria-label="Grid view"
			>
				<svg
					className={cn(
						"h-4 w-4 transition-colors",
						mode === "grid" ? "text-amber-600" : "text-stone-400",
					)}
					viewBox="0 0 16 16"
					fill="currentColor"
				>
					<rect x="1" y="1" width="6" height="6" rx="1" />
					<rect x="9" y="1" width="6" height="6" rx="1" />
					<rect x="1" y="9" width="6" height="6" rx="1" />
					<rect x="9" y="9" width="6" height="6" rx="1" />
				</svg>
			</button>
			<button
				type="button"
				onClick={() => onChange("rows")}
				className={cn(
					"rounded-md p-1.5 transition-all",
					mode === "rows" ? "bg-white shadow-sm ring-1 ring-stone-200/60" : "hover:bg-stone-50",
				)}
				aria-label="List view"
			>
				<svg
					className={cn(
						"h-4 w-4 transition-colors",
						mode === "rows" ? "text-amber-600" : "text-stone-400",
					)}
					viewBox="0 0 16 16"
					fill="currentColor"
				>
					<rect x="1" y="2" width="14" height="2.5" rx="0.75" />
					<rect x="1" y="6.75" width="14" height="2.5" rx="0.75" />
					<rect x="1" y="11.5" width="14" height="2.5" rx="0.75" />
				</svg>
			</button>
		</div>
	);
}
