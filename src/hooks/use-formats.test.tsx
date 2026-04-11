import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { useFormats, useCreateFormat, useUpdateFormat, useDeleteFormat } from "./use-formats";

vi.mock("@/lib/utils/toasts", () => ({
	toastSuccess: vi.fn(),
	toastError: vi.fn(),
	toastUpdate: vi.fn(),
}));

function createWrapper() {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={qc}>{children}</QueryClientProvider>
	);
}

const mockFormats = [
	{ id: "1", name: "Workshop", color: "#f00", slug: "workshop", activityCount: 3 },
	{ id: "2", name: "Course", color: "#0f0", slug: "course", activityCount: 1 },
];

describe("useFormats", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("fetches formats from /api/formats", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockFormats,
		} as Response);

		const { result } = renderHook(() => useFormats(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(mockFormats);
	});

	it("throws on non-ok response", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);

		const { result } = renderHook(() => useFormats(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error?.message).toBe("Failed to load formats");
	});
});

describe("useCreateFormat", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends POST and invalidates formats query", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: "3", name: "Seminar", color: "#00f" }),
		} as Response);

		const { result } = renderHook(() => useCreateFormat(), { wrapper: createWrapper() });

		await act(() => result.current.mutateAsync({ name: "Seminar", color: "#00f" }));

		expect(fetch).toHaveBeenCalledWith(
			"/api/formats",
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("throws with server error message on failure", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "Duplicate name" }),
		} as Response);

		const { result } = renderHook(() => useCreateFormat(), { wrapper: createWrapper() });

		await expect(
			act(() => result.current.mutateAsync({ name: "Dup", color: "#000" })),
		).rejects.toThrow("Duplicate name");
	});
});

describe("useUpdateFormat", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends PUT to /api/formats/:id", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: "1", name: "Updated" }),
		} as Response);

		const { result } = renderHook(() => useUpdateFormat(), { wrapper: createWrapper() });

		await act(() => result.current.mutateAsync({ id: "1", name: "Updated" }));

		expect(fetch).toHaveBeenCalledWith(
			"/api/formats/1",
			expect.objectContaining({ method: "PUT" }),
		);
	});
});

describe("useDeleteFormat", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends DELETE to /api/formats/:id", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

		const { result } = renderHook(() => useDeleteFormat(), { wrapper: createWrapper() });

		await act(() => result.current.mutateAsync("1"));

		expect(fetch).toHaveBeenCalledWith("/api/formats/1", expect.objectContaining({ method: "DELETE" }));
	});

	it("throws with server error on failure", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "Has activities" }),
		} as Response);

		const { result } = renderHook(() => useDeleteFormat(), { wrapper: createWrapper() });

		await expect(act(() => result.current.mutateAsync("1"))).rejects.toThrow("Has activities");
	});
});
