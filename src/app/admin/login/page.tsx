"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
	const [password, setPassword] = useState("");
	const { login, isLoggingIn } = useAuth();

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		try {
			await login(password);
			toast.success("Logged in successfully");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Login failed");
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-stone-50">
			<div className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
				<div className="text-center">
					<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-lg font-bold text-white shadow-lg shadow-amber-500/25">
						C
					</div>
					<h1 className="text-2xl font-bold text-stone-900">Admin Login</h1>
					<p className="mt-1 text-sm text-stone-500">CPD Portal Administration</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-stone-700">
							Password
						</label>
						<input
							id="password"
							type="password"
							required
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoggingIn}
						className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoggingIn ? "Signing in..." : "Sign in"}
					</button>
				</form>
			</div>
		</div>
	);
}
