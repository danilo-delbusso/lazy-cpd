/** Strip markdown syntax and return plain text for preview purposes */
export function stripMarkdown(md: string): string {
	return md
		.replace(/^#{1,6}\s+/gm, "") // headings
		.replace(/\*\*(.+?)\*\*/g, "$1") // bold
		.replace(/\*(.+?)\*/g, "$1") // italic
		.replace(/__(.+?)__/g, "$1") // bold alt
		.replace(/_(.+?)_/g, "$1") // italic alt
		.replace(/~~(.+?)~~/g, "$1") // strikethrough
		.replace(/`(.+?)`/g, "$1") // inline code
		.replace(/```[\s\S]*?```/g, "") // code blocks
		.replace(/^\s*[-*+]\s+/gm, "") // unordered list markers
		.replace(/^\s*\d+\.\s+/gm, "") // ordered list markers
		.replace(/^\s*>\s+/gm, "") // blockquotes
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images
		.replace(/\n{2,}/g, " ") // collapse multiple newlines
		.replace(/\n/g, " ") // remaining newlines to spaces
		.trim();
}
