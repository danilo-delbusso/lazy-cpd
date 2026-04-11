"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface GradientTextProps {
	children: ReactNode;
	colors?: string[];
	animationSpeed?: number;
	className?: string;
}

export function GradientText({
	children,
	colors = ["#f59e0b", "#eab308", "#d97706", "#fbbf24", "#f59e0b"],
	animationSpeed = 6,
	className = "",
}: GradientTextProps) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;
		el.style.backgroundImage = gradient;
		el.style.backgroundSize = `${colors.length * 100}% 100%`;
		el.style.animation = `gradient-shift ${animationSpeed}s ease infinite`;
	}, [colors, animationSpeed]);

	return (
		<span ref={ref} className={`bg-clip-text text-transparent ${className}`}>
			{children}
		</span>
	);
}
