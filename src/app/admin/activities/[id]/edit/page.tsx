"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ActivityForm } from "@/components/admin/activity-form";
import { PageTransition } from "@/components/layout/page-transition";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateActivity } from "@/hooks/use-activities";

export default function EditActivityPage() {
	const { id } = useParams<{ id: string }>();
	const updateActivity = useUpdateActivity();

	const { data: activity, isLoading } = useQuery({
		queryKey: ["activity", id],
		queryFn: async () => {
			const res = await fetch(`/api/activities/${id}`);
			if (!res.ok) throw new Error("Failed to load activity");
			return res.json();
		},
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex justify-center py-24">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!activity) {
		return <div className="py-24 text-center text-gray-400">Activity not found</div>;
	}

	return (
		<PageTransition className="mx-auto max-w-2xl px-6 py-8">
			<h1 className="text-2xl font-bold text-gray-900">Edit Activity</h1>
			<div className="mt-6">
				<ActivityForm
					mode="edit"
					initialData={activity}
					onSubmit={async (data) => {
						await updateActivity.mutateAsync({ id, ...data });
					}}
					isSubmitting={updateActivity.isPending}
				/>
			</div>
		</PageTransition>
	);
}
