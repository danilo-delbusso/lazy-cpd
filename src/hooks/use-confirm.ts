"use client";

import { useCallback } from "react";
import { useUIStore } from "@/stores/ui-store";

interface ConfirmOptions {
	title: string;
	description?: string;
	confirmLabel?: string;
	variant?: "primary" | "danger";
}

/**
 * Hook for triggering the global confirmation modal.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title: "Delete goal?", variant: "danger" });
 *   if (ok) { ... }
 */
export function useConfirm() {
	const requestConfirm = useUIStore((s) => s.requestConfirm);
	return useCallback((options: ConfirmOptions) => requestConfirm(options), [requestConfirm]);
}
