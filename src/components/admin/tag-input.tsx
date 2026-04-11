"use client";

import { useRef, useState } from "react";

interface TagInputProps {
	tags: string[];
	onTagsChange: (tags: string[]) => void;
	suggestions: string[];
	placeholder?: string;
	id?: string;
}

export function TagInput({
	tags,
	onTagsChange,
	suggestions,
	placeholder = "Type to search tags or add new...",
	id = "tags",
}: Readonly<TagInputProps>) {
	const [tagInput, setTagInput] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [highlightIdx, setHighlightIdx] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);

	const filtered = tagInput.trim()
		? suggestions.filter((t) => t.includes(tagInput.trim().toLowerCase()) && !tags.includes(t))
		: suggestions.filter((t) => !tags.includes(t));

	function addTag() {
		const tag = tagInput.trim().toLowerCase();
		if (tag && !tags.includes(tag)) {
			onTagsChange([...tags, tag]);
		}
		setTagInput("");
		setShowSuggestions(false);
		setHighlightIdx(-1);
	}

	function selectTag(tag: string) {
		onTagsChange([...tags, tag]);
		setTagInput("");
		setShowSuggestions(false);
		setHighlightIdx(-1);
		inputRef.current?.focus();
	}

	return (
		<div>
			<label htmlFor={id} className="block text-sm font-medium text-gray-700">
				Tags
			</label>
			<div className="mt-1 flex flex-wrap gap-1.5">
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-yellow-200"
					>
						{tag}
						<button
							type="button"
							onClick={() => onTagsChange(tags.filter((t) => t !== tag))}
							className="ml-0.5 text-yellow-500 hover:text-yellow-800"
						>
							×
						</button>
					</span>
				))}
			</div>
			<div className="relative mt-2">
				<input
					ref={inputRef}
					id={id}
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
							setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							setHighlightIdx((i) => Math.max(i - 1, 0));
						} else if (e.key === "Enter") {
							e.preventDefault();
							if (highlightIdx >= 0 && filtered[highlightIdx]) selectTag(filtered[highlightIdx]);
							else addTag();
						} else if (e.key === "Escape") setShowSuggestions(false);
					}}
					placeholder={placeholder}
					autoComplete="off"
					className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-300 focus:outline-none"
				/>
				{showSuggestions && filtered.length > 0 && (
					<div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
						{filtered.map((s, i) => (
							<button
								key={s}
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => selectTag(s)}
								className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${i === highlightIdx ? "bg-amber-50 text-amber-700" : "text-stone-600 hover:bg-stone-50"}`}
							>
								<span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700 ring-1 ring-yellow-200">
									{s}
								</span>
							</button>
						))}
						{tagInput.trim() && !suggestions.includes(tagInput.trim().toLowerCase()) && (
							<button
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									addTag();
									inputRef.current?.focus();
								}}
								className="flex w-full items-center gap-2 border-t border-stone-100 px-3 py-1.5 text-left text-sm text-stone-500 hover:bg-stone-50"
							>
								{`Create \u201C`}
								<span className="font-medium text-stone-700">{tagInput.trim().toLowerCase()}</span>
								{`\u201D`}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
