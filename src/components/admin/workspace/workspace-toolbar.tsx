"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteGoal } from "@/hooks/use-goals";

interface WorkspaceToolbarProps {
	goalId: string;
	goalTitle: string;
}

export function WorkspaceToolbar({ goalId, goalTitle }: Readonly<WorkspaceToolbarProps>) {
	const deleteGoal = useDeleteGoal();
	const confirm = useConfirm();
	const router = useRouter();

	async function handleDelete() {
		const ok = await confirm({
			title: "Delete Goal?",
			description: `This will permanently delete "${goalTitle}" and all its activities. This cannot be undone.`,
			confirmLabel: "Delete",
			variant: "danger",
		});
		if (ok) {
			deleteGoal.mutate(goalId, { onSuccess: () => router.push("/admin/goals") });
		}
	}

	return (
		<div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
				<div className="flex items-center gap-3">
					<Link href="/admin/goals">
						<Button variant="ghost" size="sm">
							Back to Goals
						</Button>
					</Link>
					<Link href={`/goal/${goalId}`}>
						<Button variant="ghost" size="sm">
							View Public Page
						</Button>
					</Link>
					<Button variant="danger" size="sm" onClick={handleDelete}>
						Delete Goal
					</Button>
				</div>
			</div>
		</div>
	);
}
