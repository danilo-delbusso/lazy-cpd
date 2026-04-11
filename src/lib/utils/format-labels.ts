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
	open: "bg-green-50 text-green-700 border-green-300",
	upcoming: "bg-stone-100 text-stone-500 border-stone-200",
	completed: "bg-sky-50 text-sky-700 border-sky-300",
};

/** Tailwind classes for activity status badges */
export const activityStatusColors: Record<ActivityStatusValue, string> = {
	upcoming: "bg-stone-100 text-stone-500 border-stone-200",
	in_progress: "bg-green-50 text-green-700 border-green-300",
	completed: "bg-sky-50 text-sky-700 border-sky-300",
};
