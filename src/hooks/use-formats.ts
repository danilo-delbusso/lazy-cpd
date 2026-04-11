"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess, toastUpdate } from "@/lib/utils/toasts";
import type { FormatWithCount } from "@/types";

export function useFormats() {
	return useQuery<FormatWithCount[]>({
		queryKey: ["formats"],
		queryFn: async () => {
			const res = await fetch("/api/formats");
			if (!res.ok) throw new Error("Failed to load formats");
			return res.json();
		},
	});
}

export function useCreateFormat() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: { name: string; color: string; slug?: string }) => {
			const res = await fetch("/api/formats", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to create format");
			}
			return res.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["formats"] });
			toastSuccess("Format created");
		},
		onError: (err) => toastError(err.message),
	});
}

export function useUpdateFormat() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...data }: { id: string; [key: string]: unknown }) => {
			const res = await fetch(`/api/formats/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to update format");
			}
			return res.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["formats"] });
			toastUpdate("Format updated");
		},
		onError: (err) => toastError(err.message),
	});
}

export function useDeleteFormat() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/formats/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to delete format");
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["formats"] });
			toastSuccess("Format deleted");
		},
		onError: (err) => toastError(err.message),
	});
}
