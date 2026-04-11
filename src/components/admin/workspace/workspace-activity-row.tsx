"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ActivityFormatBadge } from "@/components/activities/activity-format-badge";
import { ActivityStatusBadge } from "@/components/activities/activity-status-badge";
import { ExpandableNotesEditor } from "@/components/admin/workspace/expandable-notes-editor";
import { Button } from "@/components/ui/button";
import { useDeleteActivity, useUpdateActivity } from "@/hooks/use-activities";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormats } from "@/hooks/use-formats";
import { cn } from "@/lib/utils/cn";
import { formatDate, toInputDate } from "@/lib/utils/dates";
import { type ActivityStatusValue, activityStatusValues } from "@/lib/validations/activity";

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

interface WorkspaceActivityRowProps {
	activity: Activity;
	isExpanded: boolean;
	onToggle: () => void;
	goalTitle?: string;
	isNew?: boolean;
	onSaveNew?: (data: Record<string, unknown>) => void;
	isSavingNew?: boolean;
}

export function WorkspaceActivityRow({
	activity,
	isExpanded,
	onToggle,
	goalTitle,
	isNew,
	onSaveNew,
	isSavingNew,
}: WorkspaceActivityRowProps) {
	const updateActivity = useUpdateActivity();
	const deleteActivity = useDeleteActivity();
	const confirm = useConfirm();
	const { data: formats } = useFormats();

	const [title, setTitle] = useState(activity.title);
	const [status, setStatus] = useState(activity.status);
	const [formatId, setFormatId] = useState(activity.format.id);
	const [fullDate, setFullDate] = useState(toInputDate(activity.fullDate));
	const [notes, setNotes] = useState(activity.notes ?? "");
	const [references, setReferences] = useState(activity.references ?? "");
	const [tags, setTags] = useState(activity.tags.join(", "));

	useEffect(() => {
		if (!isNew) {
			setTitle(activity.title);
			setStatus(activity.status);
			setFormatId(activity.format.id);
			setFullDate(toInputDate(activity.fullDate));
			setNotes(activity.notes ?? "");
			setReferences(activity.references ?? "");
			setTags(activity.tags.join(", "));
		}
	}, [activity, isNew]);

	function buildPayload() {
		return {
			title: title.trim(),
			status,
			formatId,
			fullDate: new Date(fullDate).toISOString(),
			notes: notes.trim() || null,
			references: references.trim() || null,
			tags: tags
				.split(",")
				.map((t) => t.trim().toLowerCase())
				.filter(Boolean),
		};
	}

	function handleSave() {
		if (!title.trim()) return;
		if (isNew && onSaveNew) {
			onSaveNew(buildPayload());
			return;
		}
		updateActivity.mutate({ id: activity.id, ...buildPayload() }, { onSuccess: onToggle });
	}

	async function handleDelete() {
		const ok = await confirm({
			title: "Delete Activity?",
			description: `This will permanently delete "${activity.title}". This cannot be undone.`,
			confirmLabel: "Delete",
			variant: "danger",
		});
		if (ok) deleteActivity.mutate(activity.id);
	}

	function handleCancel() {
		if (isNew) {
			onToggle();
			return;
		}
		setTitle(activity.title);
		setStatus(activity.status);
		setFormatId(activity.format.id);
		setFullDate(toInputDate(activity.fullDate));
		setNotes(activity.notes ?? "");
		setReferences(activity.references ?? "");
		setTags(activity.tags.join(", "));
		onToggle();
	}

	return (
		<div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
			<button
				type="button"
				onClick={isNew ? undefined : onToggle}
				className={cn(
					"flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
					!isNew && "hover:bg-stone-50",
				)}
			>
				<span className="min-w-0 flex-1 truncate font-medium text-stone-900">
					{activity.title || (isNew ? "New Activity" : "")}
				</span>
				<ActivityFormatBadge name={activity.format.name} color={activity.format.color} />
				<ActivityStatusBadge status={activity.status as ActivityStatusValue} />
				<span className="shrink-0 text-xs text-stone-400">{formatDate(activity.fullDate)}</span>
				{!isNew && (
					<svg
						className={cn(
							"h-4 w-4 shrink-0 text-stone-400 transition-transform",
							isExpanded && "rotate-180",
						)}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
					</svg>
				)}
			</button>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="space-y-4 border-t border-stone-200 px-4 py-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Title</label>
								<input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-3">
								<div>
									<label className="block text-sm font-medium text-gray-700">Status</label>
									<select
										value={status}
										onChange={(e) => setStatus(e.target.value)}
										className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									>
										{activityStatusValues.map((s) => (
											<option key={s} value={s}>
												{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Format</label>
									<select
										value={formatId}
										onChange={(e) => setFormatId(e.target.value)}
										className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									>
										<option value="">Select format...</option>
										{formats?.map((f) => (
											<option key={f.id} value={f.id}>
												{f.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Date</label>
									<input
										type="date"
										value={fullDate}
										onChange={(e) => setFullDate(e.target.value)}
										className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									/>
								</div>
							</div>

							<ExpandableNotesEditor
								notes={notes}
								onNotesChange={setNotes}
								activityTitle={title}
								goalTitle={goalTitle}
							/>

							<div>
								<label className="block text-sm font-medium text-gray-700">References</label>
								<textarea
									rows={2}
									value={references}
									onChange={(e) => setReferences(e.target.value)}
									className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Tags (comma-separated)
								</label>
								<input
									value={tags}
									onChange={(e) => setTags(e.target.value)}
									placeholder="e.g. typescript, architecture, leadership"
									className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
							</div>

							<div className="flex items-center gap-2">
								<Button
									size="sm"
									onClick={handleSave}
									loading={isNew ? isSavingNew : updateActivity.isPending}
								>
									{isNew ? "Create" : "Save"}
								</Button>
								<Button size="sm" variant="ghost" onClick={handleCancel}>
									Cancel
								</Button>
								{!isNew && (
									<Button size="sm" variant="danger" onClick={handleDelete} className="ml-auto">
										Delete
									</Button>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
