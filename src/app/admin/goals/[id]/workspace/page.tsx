"use client";

import { useParams } from "next/navigation";
import { GoalWorkspaceHeader } from "@/components/admin/workspace/goal-workspace-header";
import { WorkspaceActivityList } from "@/components/admin/workspace/workspace-activity-list";
import { WorkspaceToolbar } from "@/components/admin/workspace/workspace-toolbar";
import { PageTransition } from "@/components/layout/page-transition";
import { Spinner } from "@/components/ui/spinner";
import { useGoal } from "@/hooks/use-goals";

export default function GoalWorkspacePage() {
	const { id } = useParams<{ id: string }>();
	const { data: goal, isLoading } = useGoal(id);

	if (isLoading) {
		return (
			<PageTransition className="mx-auto max-w-5xl px-6 py-8">
				<div className="flex items-center justify-center py-20">
					<Spinner />
				</div>
			</PageTransition>
		);
	}

	if (!goal) {
		return (
			<PageTransition className="mx-auto max-w-5xl px-6 py-8">
				<p className="py-20 text-center text-stone-400">Goal not found.</p>
			</PageTransition>
		);
	}

	return (
		<PageTransition className="mx-auto max-w-5xl px-6 py-8 pb-24">
			<GoalWorkspaceHeader goal={goal} />
			<WorkspaceActivityList goalId={goal.id} goalTitle={goal.title} activities={goal.activities} />
			<WorkspaceToolbar goalId={goal.id} goalTitle={goal.title} />
		</PageTransition>
	);
}
