"use client";

import { useTheme } from "@/hooks/use-theme";

export function useDarkMode() {
	return useTheme().resolvedTheme === "dark";
}
