"use client";

import { useSearchParams } from "next/navigation";
import { GoalForm } from "@/components/admin/goal-form";
import { PageTransition } from "@/components/layout/page-transition";
import { useCreateGoal } from "@/hooks/use-goals";

export default function NewGoalPage() {
	const createGoal = useCreateGoal();
	const searchParams = useSearchParams();

	const prefillTitle = searchParams.get("title") ?? undefined;
	const prefillDescription = searchParams.get("description") ?? undefined;

	const initialData = prefillTitle
		? {
				id: "",
				title: prefillTitle,
				description: prefillDescription ?? "",
				status: "open",
				tags: [] as string[],
			}
		: undefined;

	return (
		<PageTransition className="mx-auto max-w-2xl px-6 py-8">
			<h1 className="text-2xl font-bold text-gray-900">New Goal</h1>
			<div className="mt-6">
				<GoalForm
					mode="create"
					initialData={initialData}
					onSubmit={async (data) => {
						await createGoal.mutateAsync(data);
					}}
					isSubmitting={createGoal.isPending}
				/>
			</div>
		</PageTransition>
	);
}
