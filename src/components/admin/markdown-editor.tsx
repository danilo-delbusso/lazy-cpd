"use client";

import MDEditor from "@uiw/react-md-editor";
import { useDarkMode } from "@/hooks/use-dark-mode";

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
}: Readonly<MarkdownEditorProps>) {
	const isDark = useDarkMode();

	return (
		<div data-color-mode={isDark ? "dark" : "light"}>
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
