"use client";

import MDEditor from "@uiw/react-md-editor";

interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	height?: number;
}

export function MarkdownEditor({
	value,
	onChange,
	placeholder = "Write markdown...",
	height = 300,
}: MarkdownEditorProps) {
	return (
		<div data-color-mode="light">
			<MDEditor
				value={value}
				onChange={(val) => onChange(val ?? "")}
				preview="edit"
				height={height}
				textareaProps={{ placeholder }}
				visibleDragbar={false}
			/>
		</div>
	);
}
