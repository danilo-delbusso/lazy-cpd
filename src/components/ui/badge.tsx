import type { HTMLAttributes } from "react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	/** Tailwind background + text classes (e.g. "bg-blue-100 text-blue-800") */
	colorClasses?: string;
	/** Hex color for dynamic format badges — overrides colorClasses */
	hex?: string;
}

function relativeLuminance(hex: string) {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!m) return 0.5;
	const [r, g, b] = [m[1], m[2], m[3]].map((h) => Number.parseInt(h, 16) / 255);
	return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function Badge({
	className,
	colorClasses,
	hex,
	children,
	style,
	...props
}: Readonly<BadgeProps>) {
	const isDark = useDarkMode();

	let dynamicStyle = style;
	if (hex) {
		const luminance = relativeLuminance(hex);
		// Near-background colors turn invisible on the tinted-outline style, so fall back to a solid fill.
		const isIllegible = isDark ? luminance < 0.25 : luminance > 0.9;
		dynamicStyle = isIllegible
			? {
					backgroundColor: hex,
					borderColor: hex,
					color: luminance > 0.5 ? "#1c1917" : "#fafaf9",
					...style,
				}
			: {
					backgroundColor: `${hex}1a`,
					borderColor: hex,
					color: hex,
					...style,
				};
	}

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
				!hex &&
					(colorClasses ?? "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"),
				className,
			)}
			style={dynamicStyle}
			{...props}
		>
			{children}
		</span>
	);
}
