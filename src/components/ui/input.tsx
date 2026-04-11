import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, helperText, id, ...props }, ref) => {
		const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

		return (
			<div className="space-y-1">
				{label && (
					<label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={cn(
						"block w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm transition-colors focus:ring-2 focus:outline-none",
						error
							? "border-red-300 focus:border-red-500 focus:ring-red-500"
							: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
						className,
					)}
					aria-invalid={!!error}
					aria-describedby={error ? `${inputId}-error` : undefined}
					{...props}
				/>
				{error && (
					<p id={`${inputId}-error`} className="text-sm text-red-600">
						{error}
					</p>
				)}
				{helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
			</div>
		);
	},
);

Input.displayName = "Input";
