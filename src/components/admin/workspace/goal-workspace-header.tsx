"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useUpdateGoal } from "@/hooks/use-goals";
import { cn } from "@/lib/utils/cn";
import { goalStatusValues } from "@/lib/validations/goal";

interface GoalWorkspaceHeaderProps {
	goal: {
		id: string;
		title: string;
		description: string | null;
		status: string;
		tags: string[];
	};
}

export function GoalWorkspaceHeader({ goal }: GoalWorkspaceHeaderProps) {
	const updateGoal = useUpdateGoal();
	const [editingTitle, setEditingTitle] = useState(false);
	const [editingDesc, setEditingDesc] = useState(false);
	const [title, setTitle] = useState(goal.title);
	const [description, setDescription] = useState(goal.description ?? "");
	const [tagInput, setTagInput] = useState("");
	const [showTagSuggestions, setShowTagSuggestions] = useState(false);
	const titleRef = useRef<HTMLInputElement>(null);
	const descRef = useRef<HTMLTextAreaElement>(null);
	const tagInputRef = useRef<HTMLInputElement>(null);
	const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

	const { data: allTags = [] } = useQuery<string[]>({
		queryKey: ["goal-tags"],
		queryFn: async () => {
			const res = await fetch("/api/goals/tags");
			if (!res.ok) return [];
			return res.json();
		},
	});

	const tagSuggestions = tagInput.trim()
		? allTags.filter((t) => t.includes(tagInput.trim().toLowerCase()) && !goal.tags.includes(t))
		: allTags.filter((t) => !goal.tags.includes(t));

	useEffect(() => {
		setTitle(goal.title);
		setDescription(goal.description ?? "");
	}, [goal.title, goal.description]);

	useEffect(() => {
		if (editingTitle) titleRef.current?.focus();
	}, [editingTitle]);

	useEffect(() => {
		if (editingDesc) descRef.current?.focus();
	}, [editingDesc]);

	function save(data: Record<string, unknown>) {
		setSaveState("saving");
		updateGoal.mutate(
			{ id: goal.id, ...data },
			{
				onSettled: () => {
					setSaveState("saved");
					setTimeout(() => setSaveState("idle"), 1500);
				},
			},
		);
	}

	function saveWithTags(newTags: string[]) {
		save({ title: goal.title, description: goal.description, status: goal.status, tags: newTags });
	}

	function handleTitleBlur() {
		setEditingTitle(false);
		const trimmed = title.trim();
		if (trimmed && trimmed !== goal.title) {
			save({ title: trimmed, description: goal.description, status: goal.status, tags: goal.tags });
		} else {
			setTitle(goal.title);
		}
	}

	function handleDescBlur() {
		setEditingDesc(false);
		const val = description.trim();
		if (val !== (goal.description ?? "")) {
			save({ title: goal.title, description: val || null, status: goal.status, tags: goal.tags });
		}
	}

	function handleStatusChange(status: string) {
		save({ title: goal.title, description: goal.description, status, tags: goal.tags });
	}

	function addTag(tag: string) {
		const t = tag.trim().toLowerCase();
		if (t && !goal.tags.includes(t)) {
			saveWithTags([...goal.tags, t]);
		}
		setTagInput("");
		setShowTagSuggestions(false);
	}

	function removeTag(tag: string) {
		saveWithTags(goal.tags.filter((t) => t !== tag));
	}

	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					{editingTitle ? (
						<input
							ref={titleRef}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onBlur={handleTitleBlur}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleTitleBlur();
								if (e.key === "Escape") {
									setTitle(goal.title);
									setEditingTitle(false);
								}
							}}
							className="w-full rounded-lg border border-blue-300 px-2 py-1 text-2xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					) : (
						<h1
							onClick={() => setEditingTitle(true)}
							className="cursor-pointer rounded-lg px-2 py-1 text-2xl font-bold text-stone-900 hover:bg-stone-100"
						>
							{goal.title}
						</h1>
					)}

					{editingDesc ? (
						<textarea
							ref={descRef}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							onBlur={handleDescBlur}
							rows={2}
							className="mt-1 w-full rounded-lg border border-blue-300 px-2 py-1 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					) : (
						<p
							onClick={() => setEditingDesc(true)}
							className={cn(
								"mt-1 cursor-pointer rounded-lg px-2 py-1 text-sm hover:bg-stone-100",
								goal.description ? "text-stone-600" : "text-stone-400 italic",
							)}
						>
							{goal.description || "Add a description..."}
						</p>
					)}
				</div>

				<div className="flex items-center gap-3">
					<span
						className={cn(
							"text-xs transition-opacity",
							saveState === "idle" ? "opacity-0" : "opacity-100",
							saveState === "saving" ? "text-stone-400" : "text-green-600",
						)}
					>
						{saveState === "saving" ? "Saving..." : "Saved"}
					</span>
					<select
						value={goal.status}
						onChange={(e) => handleStatusChange(e.target.value)}
						className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{goalStatusValues.map((s) => (
							<option key={s} value={s}>
								{s.charAt(0).toUpperCase() + s.slice(1)}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Tags — inline editable */}
			<div className="flex flex-wrap items-center gap-1.5 px-2">
				{goal.tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-yellow-200"
					>
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="ml-0.5 text-yellow-500 hover:text-yellow-800"
						>
							×
						</button>
					</span>
				))}
				<div className="relative">
					<input
						ref={tagInputRef}
						value={tagInput}
						onChange={(e) => {
							setTagInput(e.target.value);
							setShowTagSuggestions(true);
						}}
						onFocus={() => setShowTagSuggestions(true)}
						onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addTag(tagInput);
							}
							if (e.key === "Escape") setShowTagSuggestions(false);
						}}
						placeholder="+ Add tag"
						className="w-24 rounded-md border-none bg-transparent px-1.5 py-0.5 text-xs text-stone-500 outline-none placeholder:text-stone-300 focus:ring-1 focus:ring-amber-300"
					/>
					{showTagSuggestions && tagSuggestions.length > 0 && (
						<div className="absolute left-0 z-20 mt-1 max-h-36 w-48 overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
							{tagSuggestions.slice(0, 10).map((s) => (
								<button
									key={s}
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => {
										addTag(s);
										tagInputRef.current?.focus();
									}}
									className="flex w-full px-3 py-1 text-left text-xs text-stone-600 hover:bg-stone-50"
								>
									<span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700 ring-1 ring-yellow-200">
										{s}
									</span>
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
