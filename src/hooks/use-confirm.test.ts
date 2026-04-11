import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock the zustand store to avoid localStorage issues
let mockConfirmModal: {
	title: string;
	description?: string;
	confirmLabel?: string;
	variant?: "primary" | "danger";
	resolve: (value: boolean) => void;
} | null = null;

const mockRequestConfirm = vi.fn(
	(options: {
		title: string;
		description?: string;
		confirmLabel?: string;
		variant?: "primary" | "danger";
	}) =>
		new Promise<boolean>((resolve) => {
			mockConfirmModal = { ...options, resolve };
		}),
);

vi.mock("@/stores/ui-store", () => ({
	useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
		selector({ requestConfirm: mockRequestConfirm }),
}));

import { useConfirm } from "./use-confirm";

describe("useConfirm", () => {
	it("returns a function", () => {
		const { result } = renderHook(() => useConfirm());
		expect(typeof result.current).toBe("function");
	});

	it("calls requestConfirm with the options", () => {
		const { result } = renderHook(() => useConfirm());

		act(() => {
			result.current({ title: "Delete?", variant: "danger" });
		});

		expect(mockRequestConfirm).toHaveBeenCalledWith({
			title: "Delete?",
			variant: "danger",
		});
	});

	it("resolves true when confirmed", async () => {
		const { result } = renderHook(() => useConfirm());

		let resolved: boolean | undefined;
		act(() => {
			result.current({ title: "Sure?" }).then((v) => {
				resolved = v;
			});
		});

		act(() => {
			mockConfirmModal?.resolve(true);
		});

		// Allow microtask to flush
		await vi.waitFor(() => expect(resolved).toBe(true));
	});

	it("resolves false when cancelled", async () => {
		const { result } = renderHook(() => useConfirm());

		let resolved: boolean | undefined;
		act(() => {
			result.current({ title: "Sure?" }).then((v) => {
				resolved = v;
			});
		});

		act(() => {
			mockConfirmModal?.resolve(false);
		});

		await vi.waitFor(() => expect(resolved).toBe(false));
	});
});
