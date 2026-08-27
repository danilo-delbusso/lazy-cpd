"use client";

import { Toaster } from "sonner";
import { useDarkMode } from "@/hooks/use-dark-mode";

export function ToastProvider() {
	const isDark = useDarkMode();

	return (
		<Toaster
			position="top-right"
			richColors
			closeButton
			duration={4000}
			theme={isDark ? "dark" : "light"}
			toastOptions={{
				className: "text-sm",
			}}
		/>
	);
}
