"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PageTransitionProps {
	children: ReactNode;
	className?: string;
}

export function PageTransition({ children, className }: Readonly<PageTransitionProps>) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

/** Wrapper for staggering children animations */
export function StaggerContainer({ children, className }: Readonly<PageTransitionProps>) {
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				hidden: {},
				visible: { transition: { staggerChildren: 0.06 } },
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function StaggerItem({ children, className }: Readonly<PageTransitionProps>) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 12 },
				visible: { opacity: 1, y: 0 },
			}}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
