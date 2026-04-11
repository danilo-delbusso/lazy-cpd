import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { useGoals, useGoal, useCreateGoal, useUpdateGoal, useDeleteGoal } from "./use-goals";

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

const mockGoals = [
	{
		id: "g1",
		title: "Learn Rust",
		description: "Systems programming",
		status: "active",
		tags: [],
		sortOrder: 0,
		totalActivities: 5,
		upcomingCount: 1,
		inProgressCount: 2,
		completedCount: 2,
		firstDate: null,
		lastDate: null,
	},
];

const mockGoalDetail = {
	id: "g1",
	title: "Learn Rust",
	description: "Systems programming",
	status: "active",
	tags: [],
	sortOrder: 0,
	activities: [],
};

describe("useGoals", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("fetches goals list", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockGoals,
		} as Response);

		const { result } = renderHook(() => useGoals(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(mockGoals);
	});

	it("uses initialData when provided", () => {
		const { result } = renderHook(() => useGoals(mockGoals as any), {
			wrapper: createWrapper(),
		});

		expect(result.current.data).toEqual(mockGoals);
	});

	it("throws on non-ok response", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);

		const { result } = renderHook(() => useGoals(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error?.message).toBe("Failed to load goals");
	});
});

describe("useGoal", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("fetches a single goal by id", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockGoalDetail,
		} as Response);

		const { result } = renderHook(() => useGoal("g1"), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(mockGoalDetail);
		expect(fetch).toHaveBeenCalledWith("/api/goals/g1");
	});

	it("is disabled when id is empty", () => {
		const { result } = renderHook(() => useGoal(""), { wrapper: createWrapper() });
		expect(result.current.fetchStatus).toBe("idle");
	});
});

describe("useCreateGoal", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends POST to /api/goals", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: "g2", title: "New Goal" }),
		} as Response);

		const { result } = renderHook(() => useCreateGoal(), { wrapper: createWrapper() });

		await act(() =>
			result.current.mutateAsync({ title: "New Goal", description: "Desc", status: "active" }),
		);

		expect(fetch).toHaveBeenCalledWith("/api/goals", expect.objectContaining({ method: "POST" }));
	});
});

describe("useUpdateGoal", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends PUT to /api/goals/:id", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: "g1", title: "Updated" }),
		} as Response);

		const { result } = renderHook(() => useUpdateGoal(), { wrapper: createWrapper() });

		await act(() => result.current.mutateAsync({ id: "g1", title: "Updated" } as any));

		expect(fetch).toHaveBeenCalledWith(
			"/api/goals/g1",
			expect.objectContaining({ method: "PUT" }),
		);
	});
});

describe("useDeleteGoal", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("sends DELETE to /api/goals/:id", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

		const { result } = renderHook(() => useDeleteGoal(), { wrapper: createWrapper() });

		await act(() => result.current.mutateAsync("g1"));

		expect(fetch).toHaveBeenCalledWith(
			"/api/goals/g1",
			expect.objectContaining({ method: "DELETE" }),
		);
	});

	it("throws with server error on failure", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "Cannot delete" }),
		} as Response);

		const { result } = renderHook(() => useDeleteGoal(), { wrapper: createWrapper() });

		await expect(act(() => result.current.mutateAsync("g1"))).rejects.toThrow("Cannot delete");
	});
});
