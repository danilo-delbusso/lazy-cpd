import type { ActivityStatusValue } from "@/lib/validations/activity";
import type { GoalStatus } from "@/lib/validations/goal";

/** Human-readable labels for goal statuses */
export const goalStatusLabels: Record<GoalStatus, string> = {
	open: "Open",
	upcoming: "Upcoming",
	completed: "Completed",
};

/** Human-readable labels for activity statuses */
export const activityStatusLabels: Record<ActivityStatusValue, string> = {
	upcoming: "Upcoming",
	in_progress: "In Progress",
	completed: "Completed",
};

/** Tailwind classes for goal status badges */
export const goalStatusColors: Record<GoalStatus, string> = {
	open: "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
	upcoming:
		"bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700",
	completed:
		"bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
};

/** Tailwind classes for activity status badges */
export const activityStatusColors: Record<ActivityStatusValue, string> = {
	upcoming:
		"bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700",
	in_progress:
		"bg-green-50 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
	completed:
		"bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
};
