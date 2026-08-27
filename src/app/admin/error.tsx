"use client";

export default function AdminError({
	error,
	reset,
}: Readonly<{ error: Error; reset: () => void }>) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
			<h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
				Something went wrong
			</h2>
			<p className="text-sm text-stone-500 dark:text-stone-400">
				{error.message || "An unexpected error occurred"}
			</p>
			<button
				type="button"
				onClick={reset}
				className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
			>
				Try again
			</button>
		</div>
	);
}
