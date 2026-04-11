"use client";

import { createContext, useContext, useState } from "react";
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

const PublicLayoutContext = createContext<PublicLayoutContextValue>(null!);
export const usePublicLayout = () => useContext(PublicLayoutContext);

export function PublicLayoutProvider({ children }: { children: React.ReactNode }) {
	const [goalFilter, setGoalFilter] = useState<GoalStatus | "all">("all");
	const [yearFilter, setYearFilter] = useState<"all" | number>("all");
	const [activityFilter, setActivityFilter] = useState<ActivityStatusValue | "all">("all");
	return (
		<PublicLayoutContext
			value={{
				goalFilter,
				setGoalFilter,
				yearFilter,
				setYearFilter,
				activityFilter,
				setActivityFilter,
			}}
		>
			{children}
		</PublicLayoutContext>
	);
}
