"use client";

import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			className="flex items-center justify-center rounded-lg bg-stone-100 p-2 text-stone-500 transition-colors hover:text-amber-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:text-amber-400"
		>
			{isDark ? (
				<svg
					className="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="4" />
					<path
						strokeLinecap="round"
						d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
					/>
				</svg>
			) : (
				<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
				</svg>
			)}
		</button>
	);
}
