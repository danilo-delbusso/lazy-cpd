"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface SessionResponse {
	authenticated: boolean;
}

export function useAuth() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const session = useQuery<SessionResponse>({
		queryKey: ["session"],
		queryFn: async () => {
			const res = await fetch("/api/admin/session");
			return res.json();
		},
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	const loginMutation = useMutation({
		mutationFn: async (password: string) => {
			const res = await fetch("/api/admin/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error ?? "Login failed");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["session"] });
			router.push("/admin");
		},
	});

	const logoutMutation = useMutation({
		mutationFn: async () => {
			await fetch("/api/admin/session", { method: "DELETE" });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["session"] });
			router.push("/");
		},
	});

	return {
		isAuthenticated: session.data?.authenticated ?? false,
		isLoading: session.isLoading,
		login: loginMutation.mutateAsync,
		loginError: loginMutation.error?.message,
		isLoggingIn: loginMutation.isPending,
		logout: logoutMutation.mutateAsync,
		isLoggingOut: logoutMutation.isPending,
	};
}
