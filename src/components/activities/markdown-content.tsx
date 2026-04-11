"use client";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
	children: string;
}

export function MarkdownContent({ children }: MarkdownContentProps) {
	return (
		<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
			{children}
		</ReactMarkdown>
	);
}
