"use client";

import { useTheme as useNextTheme } from "next-themes";

export type Theme = "system" | "light" | "dark";

/** Narrow next-themes' return to this app's Theme so callers don't handle the wider type. */
export function useTheme() {
	const { theme, setTheme, resolvedTheme } = useNextTheme();
	return {
		theme: (theme as Theme) ?? "system",
		resolvedTheme: (resolvedTheme as "light" | "dark") ?? "light",
		setTheme: (t: Theme) => setTheme(t),
	};
}
