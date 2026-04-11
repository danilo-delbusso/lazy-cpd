"use client";

import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteFormat, useFormats } from "@/hooks/use-formats";

export default function AdminFormatsPage() {
	const { data: formats, isLoading } = useFormats();
	const deleteFormat = useDeleteFormat();
	const confirm = useConfirm();

	async function handleDelete(id: string, name: string, activityCount: number) {
		if (activityCount > 0) {
			await confirm({
				title: "Cannot Delete Format",
				description: `"${name}" is used by ${activityCount} activities. Reassign them to another format first.`,
				confirmLabel: "OK",
				variant: "primary",
			});
			return;
		}
		const ok = await confirm({
			title: "Delete Format?",
			description: `This will permanently delete "${name}". This cannot be undone.`,
			confirmLabel: "Delete",
			variant: "danger",
		});
		if (ok) deleteFormat.mutate(id);
	}

	return (
		<PageTransition className="mx-auto max-w-4xl px-6 py-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">Activity Formats</h1>
				<Link href="/admin/formats/new">
					<Button>Add Format</Button>
				</Link>
			</div>

			<div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-gray-200 bg-gray-50">
						<tr>
							<th className="px-4 py-3 font-medium text-gray-600">Color</th>
							<th className="px-4 py-3 font-medium text-gray-600">Name</th>
							<th className="px-4 py-3 font-medium text-gray-600">Slug</th>
							<th className="px-4 py-3 font-medium text-gray-600 text-right">Activities</th>
							<th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{isLoading && (
							<tr>
								<td colSpan={5} className="px-4 py-8 text-center text-gray-400">
									Loading...
								</td>
							</tr>
						)}
						{!isLoading && formats?.length === 0 && (
							<tr>
								<td colSpan={5} className="px-4 py-8 text-center text-gray-400">
									No formats yet.
								</td>
							</tr>
						)}
						{!isLoading &&
							formats &&
							formats.length > 0 &&
							formats.map((f) => (
								<tr key={f.id} className="hover:bg-gray-50">
									<td className="px-4 py-3">
										<Badge hex={f.color}>{f.name}</Badge>
									</td>
									<td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
									<td className="px-4 py-3 font-mono text-xs text-gray-500">{f.slug}</td>
									<td className="px-4 py-3 text-right text-gray-500">{f.activityCount}</td>
									<td className="px-4 py-3 text-right">
										<div className="flex justify-end gap-2">
											<Link href={`/admin/formats/${f.id}/edit`}>
												<Button variant="ghost" size="sm">
													Edit
												</Button>
											</Link>
											<Button
												variant="danger"
												size="sm"
												onClick={() => handleDelete(f.id, f.name, f.activityCount)}
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
		</PageTransition>
	);
}
