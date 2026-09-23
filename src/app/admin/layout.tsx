"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";

const navItems = [
	{ href: "/admin", label: "Dashboard", exact: true },
	{ href: "/admin/goals", label: "Goals" },
	{ href: "/admin/formats", label: "Formats" },
];

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
	const { isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();
	const pathname = usePathname();
	const router = useRouter();

	const isLoginPage = pathname === "/admin/login";

	useEffect(() => {
		if (!isLoading && !isAuthenticated && !isLoginPage) {
			router.push("/admin/login");
		}
	}, [isAuthenticated, isLoading, isLoginPage, router]);

	if (isLoading && !isLoginPage) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
			</div>
		);
	}

	if (isLoginPage) {
		return <>{children}</>;
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
			{/* Header */}
			<header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
					<div className="flex items-center gap-6">
						<Link href="/admin" className="flex items-center gap-2">
							<span className="text-lg font-bold text-amber-600 dark:text-amber-500">CPD</span>
							<span className="text-sm font-medium text-stone-500 dark:text-stone-400">Admin</span>
						</Link>

						{/* Nav tabs */}
						<nav className="flex items-center gap-1">
							{navItems.map((item) => {
								const isActive = item.exact
									? pathname === item.href
									: pathname.startsWith(item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
											isActive
												? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
												: "text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200",
										)}
									>
										{item.label}
									</Link>
								);
							})}
						</nav>
					</div>

					<div className="flex items-center gap-3">
						<ThemeToggle />
						<Link
							href="/"
							className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-amber-300 hover:text-amber-700 dark:border-stone-700 dark:text-stone-300 dark:hover:border-amber-600 dark:hover:text-amber-400"
						>
							View Site
						</Link>
						<button
							type="button"
							onClick={() => logout()}
							disabled={isLoggingOut}
							className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
						>
							{isLoggingOut ? "..." : "Sign out"}
						</button>
					</div>
				</div>
			</header>

			{/* Content */}
			<main>{children}</main>
		</div>
	);
}
