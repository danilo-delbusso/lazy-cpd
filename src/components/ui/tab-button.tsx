"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function TabButton({
	active,
	href,
	children,
}: {
	active: boolean;
	href: string;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"relative px-4 py-3 text-sm font-semibold transition-colors sm:text-base",
				active ? "text-amber-700" : "text-stone-400 hover:text-stone-600",
			)}
		>
			{children}
			{active && (
				<motion.div
					layoutId="tab-indicator"
					className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-500"
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
				/>
			)}
		</Link>
	);
}
