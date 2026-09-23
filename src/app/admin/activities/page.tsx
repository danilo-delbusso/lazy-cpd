"use client";

import Link from "next/link";
import { useState } from "react";
import { ActivityFormatBadge } from "@/components/activities/activity-format-badge";
import { ActivityStatusBadge } from "@/components/activities/activity-status-badge";
import { PageTransition } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { useActivities, useDeleteActivity } from "@/hooks/use-activities";
import { useConfirm } from "@/hooks/use-confirm";
import { formatDate } from "@/lib/utils/dates";
import type { ActivityStatusValue } from "@/lib/validations/activity";

export default function AdminActivitiesPage() {
	const [page, setPage] = useState(1);
	const { data: result, isLoading } = useActivities({ page, limit: 25 });
	const deleteActivity = useDeleteActivity();
	const confirm = useConfirm();

	async function handleDelete(id: string, title: string) {
		const ok = await confirm({
			title: "Delete Activity?",
			description: `This will permanently delete "${title}". This cannot be undone.`,
			confirmLabel: "Delete",
			variant: "danger",
		});
		if (ok) deleteActivity.mutate(id);
	}

	const activities = result?.data ?? [];

	return (
		<PageTransition className="mx-auto max-w-5xl px-6 py-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Activities</h1>
				<Link href="/admin/activities/new">
					<Button>Add Activity</Button>
				</Link>
			</div>

			<div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-stone-800 dark:bg-stone-900">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-gray-200 bg-gray-50 dark:border-stone-800 dark:bg-stone-800/50">
							<tr>
								<th className="px-4 py-3 font-medium text-gray-600 dark:text-stone-400">Title</th>
								<th className="px-4 py-3 font-medium text-gray-600 dark:text-stone-400">Goal</th>
								<th className="px-4 py-3 font-medium text-gray-600 dark:text-stone-400">Date</th>
								<th className="px-4 py-3 font-medium text-gray-600 dark:text-stone-400">Status</th>
								<th className="px-4 py-3 font-medium text-gray-600 dark:text-stone-400">Format</th>
								<th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-stone-400">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-stone-800">
							{isLoading && (
								<tr>
									<td
										colSpan={6}
										className="px-4 py-8 text-center text-gray-400 dark:text-stone-500"
									>
										Loading...
									</td>
								</tr>
							)}
							{!isLoading && activities.length === 0 && (
								<tr>
									<td
										colSpan={6}
										className="px-4 py-8 text-center text-gray-400 dark:text-stone-500"
									>
										No activities yet.
									</td>
								</tr>
							)}
							{!isLoading &&
								activities.length > 0 &&
								activities.map((a) => (
									<tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-stone-800/50">
										<td className="max-w-[200px] truncate px-4 py-3 font-medium text-gray-900 dark:text-stone-100">
											{a.title}
										</td>
										<td className="max-w-[150px] truncate px-4 py-3 text-gray-500 dark:text-stone-400">
											{a.goalTitle}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-stone-400">
											{formatDate(a.fullDate)}
										</td>
										<td className="px-4 py-3">
											<ActivityStatusBadge status={a.status as ActivityStatusValue} />
										</td>
										<td className="px-4 py-3">
											<ActivityFormatBadge name={a.formatName} color={a.formatColor} />
										</td>
										<td className="px-4 py-3 text-right">
											<div className="flex justify-end gap-2">
												<Link href={`/admin/activities/${a.id}/edit`}>
													<Button variant="ghost" size="sm">
														Edit
													</Button>
												</Link>
												<Button
													variant="danger"
													size="sm"
													onClick={() => handleDelete(a.id, a.title)}
												>
													Delete
												</Button>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{result && result.totalPages > 1 && (
				<div className="mt-4 flex items-center justify-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Previous
					</Button>
					<span className="text-sm text-gray-500 dark:text-stone-400">
						Page {page} of {result.totalPages}
					</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
						disabled={page === result.totalPages}
					>
						Next
					</Button>
				</div>
			)}
		</PageTransition>
	);
}
