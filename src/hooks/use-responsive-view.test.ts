import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the UI store before importing the hook
const mockUseUIStore = vi.fn();
vi.mock("@/stores/ui-store", () => ({
	useUIStore: (selector: (s: { viewMode: "grid" | "rows" }) => unknown) =>
		selector({ viewMode: mockUseUIStore() }),
}));

// Mock matchMedia
function mockMatchMedia(matches: boolean) {
	const listeners: Array<(e: MediaQueryListEvent) => void> = [];
	const mql = {
		matches,
		addEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
			listeners.push(handler);
		}),
		removeEventListener: vi.fn(),
	};
	vi.stubGlobal(
		"matchMedia",
		vi.fn(() => mql),
	);
	return {
		mql,
		fireChange: (newMatches: boolean) => {
			for (const l of listeners) l({ matches: newMatches } as MediaQueryListEvent);
		},
	};
}

describe("useResponsiveView", () => {
	beforeEach(() => {
		mockUseUIStore.mockReturnValue("grid");
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns 'rows' on mobile regardless of store viewMode", async () => {
		mockMatchMedia(true);
		const { useResponsiveView } = await import("./use-responsive-view");
		const { result } = renderHook(() => useResponsiveView());
		expect(result.current).toBe("rows");
	});

	it("returns store viewMode on desktop", async () => {
		mockMatchMedia(false);
		const { useResponsiveView } = await import("./use-responsive-view");
		const { result } = renderHook(() => useResponsiveView());
		expect(result.current).toBe("grid");
	});

	it("returns store viewMode 'rows' on desktop when set", async () => {
		mockUseUIStore.mockReturnValue("rows");
		mockMatchMedia(false);
		const { useResponsiveView } = await import("./use-responsive-view");
		const { result } = renderHook(() => useResponsiveView());
		expect(result.current).toBe("rows");
	});

	it("reacts to matchMedia change events", async () => {
		const { fireChange } = mockMatchMedia(false);
		const { useResponsiveView } = await import("./use-responsive-view");
		const { result } = renderHook(() => useResponsiveView());
		expect(result.current).toBe("grid");

		act(() => {
			fireChange(true);
		});
		expect(result.current).toBe("rows");
	});

	it("cleans up the event listener on unmount", async () => {
		const { mql } = mockMatchMedia(false);
		const { useResponsiveView } = await import("./use-responsive-view");
		const { unmount } = renderHook(() => useResponsiveView());
		unmount();
		expect(mql.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
	});
});
