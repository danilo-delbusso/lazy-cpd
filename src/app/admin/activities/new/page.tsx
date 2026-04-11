"use client";

import { ActivityForm } from "@/components/admin/activity-form";
import { PageTransition } from "@/components/layout/page-transition";
import { useCreateActivity } from "@/hooks/use-activities";

export default function NewActivityPage() {
	const createActivity = useCreateActivity();

	return (
		<PageTransition className="mx-auto max-w-2xl px-6 py-8">
			<h1 className="text-2xl font-bold text-gray-900">New Activity</h1>
			<div className="mt-6">
				<ActivityForm
					mode="create"
					onSubmit={async (data) => {
						await createActivity.mutateAsync(data);
					}}
					isSubmitting={createActivity.isPending}
				/>
			</div>
		</PageTransition>
	);
}
