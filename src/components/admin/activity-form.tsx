"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { TagInput } from "@/components/admin/tag-input";
import { Button } from "@/components/ui/button";
import { useFormats } from "@/hooks/use-formats";
import { useGoals } from "@/hooks/use-goals";
import { toInputDate } from "@/lib/utils/dates";
import { activityStatusValues } from "@/lib/validations/activity";

const MarkdownEditor = dynamic(
	() => import("@/components/admin/markdown-editor").then((m) => ({ default: m.MarkdownEditor })),
	{ ssr: false },
);

interface ActivityFormProps {
	mode: "create" | "edit";
	initialData?: {
		id: string;
		title: string;
		goalId: string;
		fullDate: string;
		status: string;
		formatId: string;
		tags?: string[];
		notes: string | null;
		references: string | null;
	};
	onSubmit: (data: Record<string, unknown>) => Promise<void>;
	isSubmitting: boolean;
}

export function ActivityForm({ mode, initialData, onSubmit, isSubmitting }: ActivityFormProps) {
	const router = useRouter();
	const { data: goals } = useGoals();
	const { data: formats } = useFormats();

	const [title, setTitle] = useState(initialData?.title ?? "");
	const [goalId, setGoalId] = useState(initialData?.goalId ?? "");
	const [fullDate, setFullDate] = useState(
		initialData?.fullDate ? toInputDate(initialData.fullDate) : toInputDate(new Date()),
	);
	const [status, setStatus] = useState(initialData?.status ?? "upcoming");
	const [formatId, setFormatId] = useState(initialData?.formatId ?? "");
	const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
	const [notes, setNotes] = useState(initialData?.notes ?? "");
	const [references, setReferences] = useState(initialData?.references ?? "");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { data: allTags = [] } = useQuery<string[]>({
		queryKey: ["activity-tags"],
		queryFn: async () => {
			const res = await fetch("/api/activities/tags");
			if (!res.ok) return [];
			return res.json();
		},
	});

	// Also include goal tags for cross-pollination
	const { data: goalTags = [] } = useQuery<string[]>({
		queryKey: ["goal-tags"],
		queryFn: async () => {
			const res = await fetch("/api/goals/tags");
			if (!res.ok) return [];
			return res.json();
		},
	});

	const combinedTags = useMemo(
		() => [...new Set([...allTags, ...goalTags])].sort(),
		[allTags, goalTags],
	);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const errs: Record<string, string> = {};
		if (title.length < 3) errs.title = "Title must be at least 3 characters";
		if (!goalId) errs.goalId = "Goal is required";
		if (!fullDate) errs.fullDate = "Date is required";
		if (!formatId) errs.formatId = "Format is required";
		if (Object.keys(errs).length > 0) {
			setErrors(errs);
			return;
		}
		setErrors({});
		await onSubmit({
			title,
			goalId,
			fullDate: new Date(fullDate).toISOString(),
			status,
			formatId,
			tags,
			notes: notes || null,
			references: references || null,
		});
		router.push("/admin/activities");
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<div>
					<label htmlFor="title" className="block text-sm font-medium text-gray-700">
						Title
					</label>
				</div>
				<input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				<div>
					<label htmlFor="goalId" className="block text-sm font-medium text-gray-700">
						Goal
					</label>
					<select
						id="goalId"
						value={goalId}
						onChange={(e) => setGoalId(e.target.value)}
						className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value="">Select a goal...</option>
						{goals?.map((g) => (
							<option key={g.id} value={g.id}>
								{g.title}
							</option>
						))}
					</select>
					{errors.goalId && <p className="mt-1 text-sm text-red-600">{errors.goalId}</p>}
				</div>

				<div>
					<label htmlFor="fullDate" className="block text-sm font-medium text-gray-700">
						Date
					</label>
					<input
						id="fullDate"
						type="date"
						value={fullDate}
						onChange={(e) => setFullDate(e.target.value)}
						className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					{errors.fullDate && <p className="mt-1 text-sm text-red-600">{errors.fullDate}</p>}
				</div>
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				<div>
					<label htmlFor="status" className="block text-sm font-medium text-gray-700">
						Status
					</label>
					<select
						id="status"
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
					<label htmlFor="formatId" className="block text-sm font-medium text-gray-700">
						Format
					</label>
					<select
						id="formatId"
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
					{errors.formatId && <p className="mt-1 text-sm text-red-600">{errors.formatId}</p>}
				</div>
			</div>

			<div>
				<div>
					<label htmlFor="notes" className="block text-sm font-medium text-gray-700">
						Notes
					</label>
				</div>
				<div className="mt-1">
					<MarkdownEditor
						value={notes}
						onChange={setNotes}
						placeholder="Write notes in markdown..."
					/>
				</div>
			</div>

			<div>
				<label htmlFor="references" className="block text-sm font-medium text-gray-700">
					References
				</label>
				<textarea
					id="references"
					rows={2}
					value={references}
					onChange={(e) => setReferences(e.target.value)}
					className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<TagInput tags={tags} onTagsChange={setTags} suggestions={combinedTags} id="activityTags" />

			<div className="flex gap-3">
				<Button type="submit" loading={isSubmitting}>
					{mode === "create" ? "Create Activity" : "Save Changes"}
				</Button>
				<Button type="button" variant="ghost" onClick={() => router.push("/admin/activities")}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
