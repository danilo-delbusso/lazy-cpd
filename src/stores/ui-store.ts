import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfirmOptions {
	title: string;
	description?: string;
	confirmLabel?: string;
	variant?: "primary" | "danger";
}

interface UIState {
	// Sidebar
	sidebarOpen: boolean;
	toggleSidebar: () => void;
	setSidebarOpen: (open: boolean) => void;

	// Command palette
	commandPaletteOpen: boolean;
	setCommandPaletteOpen: (open: boolean) => void;

	// View mode (single global preference — grid or rows everywhere)
	viewMode: "grid" | "rows";
	setViewMode: (mode: "grid" | "rows") => void;

	// Confirmation modal
	confirmModal: (ConfirmOptions & { resolve: (value: boolean) => void }) | null;
	requestConfirm: (options: ConfirmOptions) => Promise<boolean>;
	resolveConfirm: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
	persist(
		(set, get) => ({
			// Sidebar
			sidebarOpen: true,
			toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
			setSidebarOpen: (open) => set({ sidebarOpen: open }),

			// Command palette
			commandPaletteOpen: false,
			setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

			// View mode
			viewMode: "grid" as const,
			setViewMode: (mode) => set({ viewMode: mode }),

			// Confirmation modal
			confirmModal: null,
			requestConfirm: (options) =>
				new Promise<boolean>((resolve) => {
					set({ confirmModal: { ...options, resolve } });
				}),
			resolveConfirm: (value) => {
				const modal = get().confirmModal;
				if (modal) {
					modal.resolve(value);
					set({ confirmModal: null });
				}
			},
		}),
		{
			name: "cpd-ui-store",
			version: 1,
			partialize: (state) => ({ viewMode: state.viewMode }),
		},
	),
);
