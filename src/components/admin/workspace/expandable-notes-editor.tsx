"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useAIStream } from "@/hooks/use-ai-stream";
import { cn } from "@/lib/utils/cn";

const MarkdownEditor = dynamic(
	() => import("@/components/admin/markdown-editor").then((m) => ({ default: m.MarkdownEditor })),
	{ ssr: false },
);

interface ExpandableNotesEditorProps {
	notes: string;
	onNotesChange: (notes: string) => void;
	activityTitle: string;
	goalTitle?: string;
}

export function ExpandableNotesEditor({
	notes,
	onNotesChange,
	activityTitle,
	goalTitle,
}: ExpandableNotesEditorProps) {
	const aiStream = useAIStream();
	const preAINotesRef = useRef<string | null>(null);
	const prevStreamingRef = useRef(false);

	useEffect(() => {
		if (prevStreamingRef.current && !aiStream.isStreaming && aiStream.data) {
			onNotesChange(aiStream.data);
		}
		prevStreamingRef.current = aiStream.isStreaming;
	}, [aiStream.isStreaming, aiStream.data, onNotesChange]);

	return (
		<div>
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-gray-700">Notes</label>
				{notes.trim() && !aiStream.isStreaming && (
					<button
						type="button"
						onClick={() => {
							preAINotesRef.current = notes;
							aiStream.start("/api/ai/expand-notes", { notes, activityTitle, goalTitle });
						}}
						className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
					>
						<svg
							className="h-3.5 w-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
							/>
						</svg>
						Expand with AI
					</button>
				)}
				{aiStream.isStreaming && (
					<span className="flex items-center gap-1 text-xs text-amber-500">
						<span className="h-3 w-3 animate-spin rounded-full border border-amber-400 border-t-transparent" />
						Expanding...
					</span>
				)}
			</div>
			<div className={cn("mt-1", aiStream.isStreaming && "ring-1 ring-amber-300 rounded-lg")}>
				<MarkdownEditor
					value={aiStream.isStreaming ? aiStream.data : notes}
					onChange={aiStream.isStreaming ? () => {} : onNotesChange}
				/>
			</div>
			{aiStream.isStreaming && (
				<div className="mt-1 flex items-center gap-2">
					<button
						type="button"
						onClick={() => aiStream.abort()}
						className="text-xs text-stone-400 hover:text-stone-600"
					>
						Stop & keep
					</button>
				</div>
			)}
			{!aiStream.isStreaming &&
				preAINotesRef.current !== null &&
				notes !== preAINotesRef.current && (
					<div className="mt-1 flex items-center gap-2">
						<button
							type="button"
							onClick={() => {
								onNotesChange(preAINotesRef.current!);
								preAINotesRef.current = null;
							}}
							className="text-xs text-stone-400 hover:text-stone-600"
						>
							Revert to original
						</button>
						<button
							type="button"
							onClick={() => {
								aiStream.start("/api/ai/expand-notes", {
									notes: preAINotesRef.current!,
									activityTitle,
									goalTitle,
								});
							}}
							className="text-xs text-stone-400 hover:text-stone-600"
						>
							Regenerate
						</button>
					</div>
				)}
			{aiStream.error && <p className="mt-1 text-xs text-red-500">{aiStream.error}</p>}
		</div>
	);
}
