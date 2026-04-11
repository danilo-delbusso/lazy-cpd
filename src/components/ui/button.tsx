import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
	primary: "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-amber-600/20",
	secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200 focus:ring-stone-400 shadow-none",
	danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-rose-600/20",
	ghost: "text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus:ring-stone-400 shadow-none",
} as const;

const sizes = {
	sm: "px-3 py-1.5 text-xs",
	md: "px-4 py-2 text-sm",
	lg: "px-5 py-2.5 text-base",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
	loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				disabled={disabled || loading}
				className={cn(
					"inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
					variants[variant],
					sizes[size],
					className,
				)}
				{...props}
			>
				{loading && (
					<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
				)}
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";
