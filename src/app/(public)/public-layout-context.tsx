"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ActivityStatusValue } from "@/lib/validations/activity";
import type { GoalStatus } from "@/lib/validations/goal";

interface PublicLayoutContextValue {
	goalFilter: GoalStatus | "all";
	setGoalFilter: (f: GoalStatus | "all") => void;
	yearFilter: "all" | number;
	setYearFilter: (y: "all" | number) => void;
	activityFilter: ActivityStatusValue | "all";
	setActivityFilter: (f: ActivityStatusValue | "all") => void;
}

// biome-ignore lint/style/noNonNullAssertion: context is always provided by PublicLayoutProvider
const PublicLayoutContext = createContext<PublicLayoutContextValue>(null!);
export const usePublicLayout = () => useContext(PublicLayoutContext);

export function PublicLayoutProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	const [goalFilter, setGoalFilter] = useState<GoalStatus | "all">("all");
	const [yearFilter, setYearFilter] = useState<"all" | number>("all");
	const [activityFilter, setActivityFilter] = useState<ActivityStatusValue | "all">("all");
	const value = useMemo(
		() => ({
			goalFilter,
			setGoalFilter,
			yearFilter,
			setYearFilter,
			activityFilter,
			setActivityFilter,
		}),
		[goalFilter, yearFilter, activityFilter],
	);
	return <PublicLayoutContext value={value}>{children}</PublicLayoutContext>;
}
