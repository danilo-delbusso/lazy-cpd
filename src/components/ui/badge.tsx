import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	/** Tailwind background + text classes (e.g. "bg-blue-100 text-blue-800") */
	colorClasses?: string;
	/** Hex color for dynamic format badges — overrides colorClasses */
	hex?: string;
}

export function Badge({ className, colorClasses, hex, children, style, ...props }: BadgeProps) {
	const dynamicStyle = hex
		? {
				backgroundColor: `${hex}1a`,
				color: hex,
				...style,
			}
		: style;

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
				!hex && (colorClasses ?? "bg-stone-100 text-stone-700"),
				className,
			)}
			style={dynamicStyle}
			{...props}
		>
			{children}
		</span>
	);
}
