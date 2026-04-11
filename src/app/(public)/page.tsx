import type { Metadata } from "next";
import { getAllGoals } from "@/lib/db/queries/goals";
import type { GoalWithStats } from "@/types";
import { GoalsPageClient } from "./goals-page-client";

const siteOwner = process.env.NEXT_PUBLIC_SITE_OWNER || "CPD Portal";

export const metadata: Metadata = {
	title: `Goals | CPD Portal — ${siteOwner}`,
	description: `Professional development goals tracked by ${siteOwner}.`,
};

export default async function GoalsPage() {
	const goals = await getAllGoals();

	// JSON round-trip to match the shape the API returns (dates as strings)
	// so initialData is consistent with subsequent TanStack Query refetches
	const serialized = JSON.parse(JSON.stringify(goals)) as GoalWithStats[];

	return <GoalsPageClient initialGoals={serialized} />;
}
