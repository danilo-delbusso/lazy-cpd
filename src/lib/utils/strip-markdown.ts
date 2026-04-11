/** Strip markdown syntax and return plain text for preview purposes */
export function stripMarkdown(md: string): string {
	// Guard against ReDoS: truncate overly long input
	const safe = md.length > 10_000 ? md.slice(0, 10_000) : md;

	return safe
		.replaceAll(/```[\s\S]*?```/g, "") // code blocks (before inline code)
		.replaceAll(/^#{1,6}\s+/gm, "") // headings
		.replaceAll(/\*\*(.+?)\*\*/g, "$1") // bold
		.replaceAll(/\*(.+?)\*/g, "$1") // italic
		.replaceAll(/__(.+?)__/g, "$1") // bold alt
		.replaceAll(/_(.+?)_/g, "$1") // italic alt
		.replaceAll(/~~(.+?)~~/g, "$1") // strikethrough
		.replaceAll(/`(.+?)`/g, "$1") // inline code
		.replaceAll(/^[ \t]*[-*+]\s/gm, "") // unordered list markers
		.replaceAll(/^[ \t]*\d+\.\s/gm, "") // ordered list markers
		.replaceAll(/^[ \t]*>\s/gm, "") // blockquotes
		.replaceAll(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1") // images (before links)
		.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // links
		.replaceAll(/\n{2,}/g, " ") // collapse multiple newlines
		.replaceAll("\n", " ") // remaining newlines to spaces
		.trim();
}
