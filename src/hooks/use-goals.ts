"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess, toastUpdate } from "@/lib/utils/toasts";
import type { GoalWithStats } from "@/types";

export function useGoals(initialData?: GoalWithStats[]) {
	return useQuery<GoalWithStats[]>({
		queryKey: ["goals"],
		queryFn: async () => {
			const res = await fetch("/api/goals");
			if (!res.ok) throw new Error("Failed to load goals");
			return res.json();
		},
		...(initialData ? { initialData } : {}),
	});
}

interface GoalDetailActivity {
	id: string;
	title: string;
	fullDate: string;
	status: string;
	notes: string | null;
	references: string | null;
	tags: string[];
	format: { id: string; name: string; color: string };
}

interface GoalDetail {
	id: string;
	title: string;
	description: string;
	status: string;
	tags: string[];
	sortOrder: number;
	activities: GoalDetailActivity[];
}

export function useGoal(id: string, initialData?: GoalDetail) {
	return useQuery<GoalDetail>({
		queryKey: ["goals", id],
		queryFn: async () => {
			const res = await fetch(`/api/goals/${id}`);
			if (!res.ok) throw new Error("Failed to load goal");
			return res.json();
		},
		enabled: !!id,
		...(initialData ? { initialData } : {}),
	});
}

export function useCreateGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: { title: string; description: string; status: string }) => {
			const res = await fetch("/api/goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to create goal");
			}
			return res.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["goals"] });
			toastSuccess("Goal created");
		},
		onError: (err) => toastError(err.message),
	});
}

export function useUpdateGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...data }: { id: string } & Partial<GoalWithStats>) => {
			const res = await fetch(`/api/goals/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to update goal");
			}
			return res.json();
		},
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: ["goals"] });
			qc.invalidateQueries({ queryKey: ["goals", vars.id] });
			toastUpdate("Goal updated");
		},
		onError: (err) => toastError(err.message),
	});
}

export function useDeleteGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to delete goal");
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["goals"] });
			toastSuccess("Goal deleted");
		},
		onError: (err) => toastError(err.message),
	});
}
