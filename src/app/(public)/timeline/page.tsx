import type { Metadata } from "next";
import type { ActivityWithJoins } from "@/hooks/use-activities";
import { getAllActivities } from "@/lib/db/queries/activities";
import { serializeDates } from "@/lib/utils/serialize";
import type { PaginatedResult } from "@/types";
import { TimelinePageClient } from "./timeline-page-client";

const siteOwner = process.env.NEXT_PUBLIC_SITE_OWNER || "CPD Portal";

export const metadata: Metadata = {
	title: `Timeline | CPD Portal — ${siteOwner}`,
	description: `Professional development activity timeline for ${siteOwner}.`,
};

export default async function TimelinePage() {
	const activitiesPage = await getAllActivities({}, { page: 1, limit: 30 });

	// Convert Date objects to ISO strings so initialData matches TanStack Query refetches
	const serialized = serializeDates(
		activitiesPage,
	) as unknown as PaginatedResult<ActivityWithJoins>;

	return <TimelinePageClient initialActivities={serialized} />;
}
