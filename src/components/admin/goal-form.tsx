"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { goalStatusValues } from "@/lib/validations/goal";

interface GoalFormProps {
	mode: "create" | "edit";
	initialData?: {
		id: string;
		title: string;
		description: string;
		status: string;
		tags?: string[];
	};
	onSubmit: (data: {
		title: string;
		description: string;
		status: string;
		tags: string[];
	}) => Promise<void>;
	isSubmitting: boolean;
}

export function GoalForm({ mode, initialData, onSubmit, isSubmitting }: Readonly<GoalFormProps>) {
	const router = useRouter();
	const [title, setTitle] = useState(initialData?.title ?? "");
	const [description, setDescription] = useState(initialData?.description ?? "");
	const [status, setStatus] = useState(initialData?.status ?? "open");
	const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
	const [tagInput, setTagInput] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [highlightIdx, setHighlightIdx] = useState(-1);
	const tagInputRef = useRef<HTMLInputElement>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { data: allTags = [] } = useQuery<string[]>({
		queryKey: ["goal-tags"],
		queryFn: async () => {
			const res = await fetch("/api/goals/tags");
			if (!res.ok) return [];
			return res.json();
		},
	});

	const suggestions = useMemo(() => {
		const trimmed = tagInput.trim().toLowerCase();
		return trimmed
			? allTags.filter((t) => t.includes(trimmed) && !tags.includes(t))
			: allTags.filter((t) => !tags.includes(t));
	}, [tagInput, allTags, tags]);

	function addTag() {
		const tag = tagInput.trim().toLowerCase();
		if (tag && !tags.includes(tag)) {
			setTags([...tags, tag]);
		}
		setTagInput("");
	}

	function removeTag(tag: string) {
		setTags(tags.filter((t) => t !== tag));
	}

	async function handleSubmit() {
		const errs: Record<string, string> = {};
		if (title.length < 3) errs.title = "Title must be at least 3 characters";
		if (description.length < 10) errs.description = "Description must be at least 10 characters";
		if (Object.keys(errs).length > 0) {
			setErrors(errs);
			return;
		}
		setErrors({});
		await onSubmit({ title, description, status, tags });
		router.push("/admin/goals");
	}

	return (
		<form action={handleSubmit} className="space-y-6">
			<div>
				<label
					htmlFor="title"
					className="block text-sm font-medium text-gray-700 dark:text-stone-300"
				>
					Title
				</label>
				<input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
				/>
				{errors.title && (
					<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
				)}
			</div>

			<div>
				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium text-gray-700 dark:text-stone-300"
					>
						Description
					</label>
				</div>
				<textarea
					id="description"
					rows={4}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
				/>
				{errors.description && (
					<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
				)}
			</div>

			<div>
				<label
					htmlFor="status"
					className="block text-sm font-medium text-gray-700 dark:text-stone-300"
				>
					Status
				</label>
				<select
					id="status"
					value={status}
					onChange={(e) => setStatus(e.target.value)}
					className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
				>
					{goalStatusValues.map((s) => (
						<option key={s} value={s}>
							{s.charAt(0).toUpperCase() + s.slice(1)}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor="tags"
					className="block text-sm font-medium text-gray-700 dark:text-stone-300"
				>
					Tags
				</label>
				<div className="mt-1 flex flex-wrap gap-1.5">
					{tags.map((tag) => (
						<span
							key={tag}
							className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:ring-yellow-800"
						>
							{tag}
							<button
								type="button"
								onClick={() => removeTag(tag)}
								className="ml-0.5 text-yellow-500 hover:text-yellow-800 dark:text-yellow-500 dark:hover:text-yellow-300"
							>
								×
							</button>
						</span>
					))}
				</div>
				<div className="relative mt-2">
					<input
						ref={tagInputRef}
						id="tags"
						value={tagInput}
						onChange={(e) => {
							setTagInput(e.target.value);
							setShowSuggestions(true);
							setHighlightIdx(-1);
						}}
						onFocus={() => setShowSuggestions(true)}
						onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
						onKeyDown={(e) => {
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
							} else if (e.key === "ArrowUp") {
								e.preventDefault();
								setHighlightIdx((i) => Math.max(i - 1, 0));
							} else if (e.key === "Enter") {
								e.preventDefault();
								if (highlightIdx >= 0 && suggestions[highlightIdx]) {
									setTags([...tags, suggestions[highlightIdx]]);
									setTagInput("");
									setShowSuggestions(false);
									setHighlightIdx(-1);
								} else {
									addTag();
								}
							} else if (e.key === "Escape") {
								setShowSuggestions(false);
							}
						}}
						placeholder="Type to search tags or add new..."
						autoComplete="off"
						className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-300 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
					/>
					{showSuggestions && suggestions.length > 0 && (
						<div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
							{suggestions.map((s, i) => (
								<button
									key={s}
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => {
										setTags([...tags, s]);
										setTagInput("");
										setShowSuggestions(false);
										setHighlightIdx(-1);
										tagInputRef.current?.focus();
									}}
									className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
										i === highlightIdx
											? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
											: "text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
									}`}
								>
									<span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:ring-yellow-800">
										{s}
									</span>
								</button>
							))}
							{tagInput.trim() && !allTags.includes(tagInput.trim().toLowerCase()) && (
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => {
										addTag();
										tagInputRef.current?.focus();
									}}
									className="flex w-full items-center gap-2 border-t border-stone-100 px-3 py-1.5 text-left text-sm text-stone-500 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800"
								>
									{`Create \u201C`}
									<span className="font-medium text-stone-700 dark:text-stone-200">
										{tagInput.trim().toLowerCase()}
									</span>
									{`\u201D`}
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="flex gap-3">
				<Button type="submit" loading={isSubmitting}>
					{mode === "create" ? "Create Goal" : "Save Changes"}
				</Button>
				<Button type="button" variant="ghost" onClick={() => router.push("/admin/goals")}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
