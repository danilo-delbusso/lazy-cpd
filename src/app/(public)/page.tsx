import type { Metadata } from "next";
import { getAllGoals } from "@/lib/db/queries/goals";
import { serializeDates } from "@/lib/utils/serialize";
import type { GoalWithStats } from "@/types";
import { GoalsPageClient } from "./goals-page-client";

const siteOwner = process.env.NEXT_PUBLIC_SITE_OWNER || "CPD Portal";

export const metadata: Metadata = {
	title: `Goals | CPD Portal — ${siteOwner}`,
	description: `Professional development goals tracked by ${siteOwner}.`,
};

export default async function GoalsPage() {
	const goals = await getAllGoals();

	// Convert Date objects to ISO strings so initialData matches TanStack Query refetches
	const serialized = serializeDates(goals) as GoalWithStats[];

	return <GoalsPageClient initialGoals={serialized} />;
}
