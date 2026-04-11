"use client";

import { useMemo, useState } from "react";
import { WorkspaceActivityRow } from "@/components/admin/workspace/workspace-activity-row";
import { Button } from "@/components/ui/button";
import { useCreateActivity } from "@/hooks/use-activities";
import { useFormats } from "@/hooks/use-formats";

const activityStatusOrder: Record<string, number> = { in_progress: 0, upcoming: 1, completed: 2 };

interface Activity {
	id: string;
	title: string;
	fullDate: string;
	status: string;
	notes: string | null;
	references: string | null;
	tags: string[];
	format: { id: string; name: string; color: string };
}

interface WorkspaceActivityListProps {
	goalId: string;
	goalTitle: string;
	activities: Activity[];
}

export function WorkspaceActivityList({
	goalId,
	goalTitle,
	activities,
}: Readonly<WorkspaceActivityListProps>) {
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [showNewForm, setShowNewForm] = useState(false);
	const createActivity = useCreateActivity();
	const { data: formats } = useFormats();

	const sorted = useMemo(() => {
		return [...activities].sort((a, b) => {
			const sa = activityStatusOrder[a.status] ?? 9;
			const sb = activityStatusOrder[b.status] ?? 9;
			if (sa !== sb) return sa - sb;
			return new Date(b.fullDate).getTime() - new Date(a.fullDate).getTime();
		});
	}, [activities]);

	function handleToggle(id: string) {
		setExpandedId((prev) => (prev === id ? null : id));
	}

	async function handleCreate(data: Record<string, unknown>) {
		createActivity.mutate({ ...data, goalId }, { onSuccess: () => setShowNewForm(false) });
	}

	return (
		<div className="mt-8">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-stone-800">Activities ({activities.length})</h2>
				<Button size="sm" onClick={() => setShowNewForm(true)} disabled={showNewForm}>
					Add Activity
				</Button>
			</div>

			<div className="mt-4 space-y-2">
				{showNewForm && (
					<WorkspaceActivityRow
						activity={{
							id: "__new__",
							title: "",
							fullDate: new Date().toISOString(),
							status: "upcoming",
							notes: null,
							references: null,
							tags: [],
							format: formats?.[0]
								? { id: formats[0].id, name: formats[0].name, color: formats[0].color }
								: { id: "", name: "", color: "#888" },
						}}
						isNew
						isExpanded
						onToggle={() => setShowNewForm(false)}
						goalTitle={goalTitle}
						onSaveNew={handleCreate}
						isSavingNew={createActivity.isPending}
					/>
				)}

				{sorted.length === 0 && !showNewForm ? (
					<div className="rounded-xl border border-dashed border-stone-300 py-12 text-center text-stone-400">
						No activities yet. Add one to get started.
					</div>
				) : (
					sorted.map((activity) => (
						<WorkspaceActivityRow
							key={activity.id}
							activity={activity}
							isExpanded={expandedId === activity.id}
							onToggle={() => handleToggle(activity.id)}
							goalTitle={goalTitle}
						/>
					))
				)}
			</div>
		</div>
	);
}
