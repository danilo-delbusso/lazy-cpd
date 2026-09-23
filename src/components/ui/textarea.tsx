import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, error, showCount, maxLength, value, id, ...props }, ref) => {
		const textareaId = id ?? label?.toLowerCase().replaceAll(/\s+/g, "-");
		const charCount = typeof value === "string" ? value.length : 0;

		return (
			<div className="space-y-1">
				{label && (
					<label
						htmlFor={textareaId}
						className="block text-sm font-medium text-gray-700 dark:text-stone-300"
					>
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={textareaId}
					value={value}
					maxLength={maxLength}
					rows={4}
					className={cn(
						"block w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm transition-colors focus:ring-2 focus:outline-none dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500",
						error
							? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-800 dark:focus:border-red-500 dark:focus:ring-red-500"
							: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-stone-700 dark:focus:border-amber-500 dark:focus:ring-amber-500",
						className,
					)}
					aria-invalid={!!error}
					aria-describedby={error ? `${textareaId}-error` : undefined}
					{...props}
				/>
				<div className="flex justify-between">
					{error ? (
						<p id={`${textareaId}-error`} className="text-sm text-red-600 dark:text-red-400">
							{error}
						</p>
					) : (
						<span />
					)}
					{showCount && maxLength && (
						<span className="text-xs text-gray-400 dark:text-stone-500">
							{charCount}/{maxLength}
						</span>
					)}
				</div>
			</div>
		);
	},
);

Textarea.displayName = "Textarea";
