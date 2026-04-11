import type { Metadata } from "next";
import type { ActivityWithJoins } from "@/hooks/use-activities";
import { getAllActivities } from "@/lib/db/queries/activities";
import type { PaginatedResult } from "@/types";
import { TimelinePageClient } from "./timeline-page-client";

const siteOwner = process.env.NEXT_PUBLIC_SITE_OWNER || "CPD Portal";

export const metadata: Metadata = {
	title: `Timeline | CPD Portal — ${siteOwner}`,
	description: `Professional development activity timeline for ${siteOwner}.`,
};

export default async function TimelinePage() {
	const activitiesPage = await getAllActivities({}, { page: 1, limit: 30 });

	// JSON round-trip to match the shape the API returns (dates as strings)
	// so initialData is consistent with subsequent TanStack Query refetches
	const serialized = JSON.parse(
		JSON.stringify(activitiesPage),
	) as PaginatedResult<ActivityWithJoins>;

	return <TimelinePageClient initialActivities={serialized} />;
}
