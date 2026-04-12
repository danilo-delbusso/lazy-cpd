import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	useActivities,
	useCreateActivity,
	useDeleteActivity,
	useInfiniteActivities,
	useUpdateActivity,
} from "./use-activities";

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

const mockPage = {
	data: [
		{
			id: "a1",
			goalId: "g1",
			title: "Activity 1",
			fullDate: "2026-01-15",
			status: "completed",
			formatId: "f1",
			notes: null,
			references: null,
			tags: [],
			goalTitle: "Goal 1",
			formatName: "Workshop",
			formatColor: "#f00",
		},
	],
	total: 1,
	page: 1,
	limit: 25,
	totalPages: 1,
};

describe("useActivities", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("fetches activities with default filters", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockPage,
		} as Response);

		const { result } = renderHook(() => useActivities(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(mockPage);
		expect(fetch).toHaveBeenCalledWith(expect.stringContaining("page=1&limit=25"));
	});

	it("passes filters as query params", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockPage,
		} as Response);

		renderHook(
			() =>
				useActivities({
					goalId: "g1",
					status: "completed",
					formatId: "f1",
					from: "2026-01-01",
					to: "2026-12-31",
					page: 2,
					limit: 10,
				}),
			{ wrapper: createWrapper() },
		);

		await waitFor(() => expect(fetch).toHaveBeenCalled());
		const url = vi.mocked(fetch).mock.calls[0][0] as string;
		expect(url).toContain("goalId=g1");
		expect(url).toContain("status=completed");
		expect(url).toContain("formatId=f1");
		expect(url).toContain("from=2026-01-01");
		expect(url).toContain("to=2026-12-31");
		expect(url).toContain("page=2");
		expect(url).toContain("limit=10");
	});

	it("throws on failure", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);

		const { result } = renderHook(() => useActivities(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error?.message).toBe("Failed to load activities");
	});
});

describe("useInfiniteActivities", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("fetches first page and detects no next page", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockPage,
		} as Response);

		const { result } = renderHook(() => useInfiniteActivities(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.pages).toHaveLength(1);
		expect(result.current.hasNextPage).toBe(false);
	});

	it("detects next page when more pages available", async () => {
		const multiPage = { ...mockPage, page: 1, totalPages: 3 };
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => multiPage,
		} as Response);

		const { result } = renderHook(() => useInfiniteActivities(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.hasNextPage).toBe(true);
	});

	it("uses initialData when provided", () => {
		const { result } = renderHook(() => useInfiniteActivities({}, mockPage), {
			wrapper: createWrapper(),
		});

		expect(result.current.data?.pages[0]).toEqual(mockPage);
	});
});

describe("useCreateActivity", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends POST to /api/activities", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: "a2" }),
		} as Response);

		const { result } = renderHook(() => useCreateActivity(), { wrapper: createWrapper() });

		await act(() => result.current.mutateAsync({ title: "New", goalId: "g1", formatId: "f1" }));

		expect(fetch).toHaveBeenCalledWith(
			"/api/activities",
			expect.objectContaining({ method: "POST" }),
		);
	});
});

describe("useUpdateActivity", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends PUT to /api/activities/:id", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: "a1", title: "Updated" }),
		} as Response);

		const { result } = renderHook(() => useUpdateActivity(), { wrapper: createWrapper() });

		await act(() =>
			result.current.mutateAsync({
				id: "a1",
				title: "Updated",
			} as { id: string } & Partial<import("./use-activities").ActivityWithJoins>),
		);

		expect(fetch).toHaveBeenCalledWith(
			"/api/activities/a1",
			expect.objectContaining({ method: "PUT" }),
		);
	});
});

describe("useDeleteActivity", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends DELETE to /api/activities/:id", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

		const { result } = renderHook(() => useDeleteActivity(), { wrapper: createWrapper() });

		await act(() => result.current.mutateAsync("a1"));

		expect(fetch).toHaveBeenCalledWith(
			"/api/activities/a1",
			expect.objectContaining({ method: "DELETE" }),
		);
	});

	it("throws with server error on failure", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "Not found" }),
		} as Response);

		const { result } = renderHook(() => useDeleteActivity(), { wrapper: createWrapper() });

		await expect(act(() => result.current.mutateAsync("a1"))).rejects.toThrow("Not found");
	});
});
