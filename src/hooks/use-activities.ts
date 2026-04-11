"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess, toastUpdate } from "@/lib/utils/toasts";
import type { PaginatedResult } from "@/types";

export interface ActivityWithJoins {
	id: string;
	goalId: string;
	title: string;
	fullDate: string;
	status: string;
	formatId: string;
	notes: string | null;
	references: string | null;
	tags: string[];
	goalTitle: string;
	formatName: string;
	formatColor: string;
}

interface ActivityFilters {
	goalId?: string;
	status?: string;
	formatId?: string;
	from?: string;
	to?: string;
	page?: number;
	limit?: number;
}

export function useActivities(filters: ActivityFilters = {}) {
	const params = new URLSearchParams();
	if (filters.goalId) params.set("goalId", filters.goalId);
	if (filters.status) params.set("status", filters.status);
	if (filters.formatId) params.set("formatId", filters.formatId);
	if (filters.from) params.set("from", filters.from);
	if (filters.to) params.set("to", filters.to);
	params.set("page", String(filters.page ?? 1));
	params.set("limit", String(filters.limit ?? 25));

	return useQuery<PaginatedResult<ActivityWithJoins>>({
		queryKey: ["activities", filters],
		queryFn: async () => {
			const res = await fetch(`/api/activities?${params}`);
			if (!res.ok) throw new Error("Failed to load activities");
			return res.json();
		},
	});
}

export function useInfiniteActivities(
	filters: Omit<ActivityFilters, "page"> = {},
	initialData?: PaginatedResult<ActivityWithJoins>,
) {
	return useInfiniteQuery<PaginatedResult<ActivityWithJoins>>({
		queryKey: ["activities", "infinite", filters],
		queryFn: async ({ pageParam }) => {
			const params = new URLSearchParams();
			if (filters.goalId) params.set("goalId", filters.goalId);
			if (filters.status) params.set("status", filters.status);
			if (filters.formatId) params.set("formatId", filters.formatId);
			if (filters.from) params.set("from", filters.from);
			if (filters.to) params.set("to", filters.to);
			params.set("page", String(pageParam));
			params.set("limit", String(filters.limit ?? 30));
			const res = await fetch(`/api/activities?${params}`);
			if (!res.ok) throw new Error("Failed to load activities");
			return res.json();
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		...(initialData ? { initialData: { pages: [initialData], pageParams: [1] } } : {}),
	});
}

export function useCreateActivity() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: Record<string, unknown>) => {
			const res = await fetch("/api/activities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to create activity");
			}
			return res.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["activities"] });
			qc.invalidateQueries({ queryKey: ["goals"] });
			toastSuccess("Activity created");
		},
		onError: (err) => toastError(err.message),
	});
}

export function useUpdateActivity() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...data }: { id: string } & Partial<ActivityWithJoins>) => {
			const res = await fetch(`/api/activities/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to update activity");
			}
			return res.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["activities"] });
			qc.invalidateQueries({ queryKey: ["goals"] });
			toastUpdate("Activity updated");
		},
		onError: (err) => toastError(err.message),
	});
}

export function useDeleteActivity() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to delete activity");
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["activities"] });
			qc.invalidateQueries({ queryKey: ["goals"] });
			toastSuccess("Activity deleted");
		},
		onError: (err) => toastError(err.message),
	});
}
