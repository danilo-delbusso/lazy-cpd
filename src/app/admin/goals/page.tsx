"use client";

import Link from "next/link";
import { useMemo } from "react";
import { GoalStatusBadge } from "@/components/goals/goal-status-badge";
import { PageTransition } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/hooks/use-goals";

const statusOrder: Record<string, number> = { open: 0, upcoming: 1, completed: 2 };

export default function AdminGoalsPage() {
	const { data: goals, isLoading } = useGoals();

	const sorted = useMemo(() => {
		if (!goals) return [];
		return [...goals].sort((a, b) => {
			const sa = statusOrder[a.status] ?? 9;
			const sb = statusOrder[b.status] ?? 9;
			if (sa !== sb) return sa - sb;
			const da = a.lastDate ? new Date(a.lastDate).getTime() : 0;
			const db = b.lastDate ? new Date(b.lastDate).getTime() : 0;
			return db - da;
		});
	}, [goals]);

	return (
		<PageTransition className="mx-auto max-w-5xl px-6 py-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-stone-900">Goals</h1>
					<p className="mt-0.5 text-sm text-stone-500">{goals?.length ?? 0} goals</p>
				</div>
				<Link href="/admin/goals/new">
					<Button>Add Goal</Button>
				</Link>
			</div>

			<div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-gray-200 bg-gray-50">
						<tr>
							<th className="px-4 py-3 font-medium text-gray-600">Title</th>
							<th className="px-4 py-3 font-medium text-gray-600">Status</th>
							<th className="px-4 py-3 font-medium text-gray-600 text-right">Activities</th>
							<th className="px-4 py-3 font-medium text-gray-600 text-right" />
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{isLoading && (
							<tr>
								<td colSpan={4} className="px-4 py-8 text-center text-gray-400">
									Loading...
								</td>
							</tr>
						)}
						{!isLoading && sorted.length === 0 && (
							<tr>
								<td colSpan={4} className="px-4 py-8 text-center text-gray-400">
									No goals yet.
								</td>
							</tr>
						)}
						{!isLoading &&
							sorted.length > 0 &&
							sorted.map((goal) => (
								<tr key={goal.id} className="hover:bg-gray-50">
									<td className="px-4 py-3 font-medium text-gray-900">{goal.title}</td>
									<td className="px-4 py-3">
										<GoalStatusBadge status={goal.status} />
									</td>
									<td className="px-4 py-3 text-right text-gray-500">{goal.totalActivities}</td>
									<td className="px-4 py-3 text-right">
										<Link href={`/admin/goals/${goal.id}/workspace`}>
											<Button variant="ghost" size="sm">
												Workspace
											</Button>
										</Link>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
		</PageTransition>
	);
}
