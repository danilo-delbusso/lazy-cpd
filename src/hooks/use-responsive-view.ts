"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/ui-store";

/** Returns the user's chosen viewMode, but forces "rows" on mobile (<640px) */
export function useResponsiveView() {
	const viewMode = useUIStore((s) => s.viewMode);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mq = globalThis.matchMedia("(max-width: 639px)");
		setIsMobile(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return isMobile ? ("rows" as const) : viewMode;
}
