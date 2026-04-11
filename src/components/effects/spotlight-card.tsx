"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SpotlightCardProps extends React.PropsWithChildren {
	className?: string;
	spotlightColor?: string;
}

export const SpotlightCard: React.FC<Readonly<SpotlightCardProps>> = ({
	children,
	className = "",
	spotlightColor = "rgba(255, 255, 255, 0.25)",
}) => {
	const divRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [opacity, setOpacity] = useState(0);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		const el = divRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
	}, []);

	const handleMouseEnter = useCallback(() => setOpacity(0.6), []);
	const handleMouseLeave = useCallback(() => setOpacity(0), []);

	useEffect(() => {
		const el = divRef.current;
		if (!el) return;
		el.addEventListener("mousemove", handleMouseMove);
		el.addEventListener("mouseenter", handleMouseEnter);
		el.addEventListener("mouseleave", handleMouseLeave);
		return () => {
			el.removeEventListener("mousemove", handleMouseMove);
			el.removeEventListener("mouseenter", handleMouseEnter);
			el.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

	return (
		<div ref={divRef} className={`relative overflow-hidden ${className}`}>
			<div
				className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
				style={{
					opacity,
					background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
				}}
			/>
			{children}
		</div>
	);
};
