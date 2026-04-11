/** Shared system prompt for CPD AI capabilities */
const CPD_SYSTEM_PROMPT =
	"You are an AI assistant for a Continuing Professional Development (CPD) portfolio. The user is a professional tracking their learning goals and activities. Your responses should be practical, specific, and professionally written. Focus on actionable learning outcomes.";

/** Wrap user-provided content in delimiters to prevent prompt confusion */
function wrapUserData(content: string): string {
	return `===USER DATA===\n${content}\n===END USER DATA===`;
}

export function expandNotesPrompt(
	rawNotes: string,
	activityTitle: string,
	goalTitle?: string,
): { system: string; user: string } {
	const goalContext = goalTitle ? ` (part of the goal: "${goalTitle}")` : "";
	return {
		system: CPD_SYSTEM_PROMPT,
		user: `I have rough notes from a CPD activity titled "${activityTitle}"${goalContext}.

Turn these notes into structured **key learnings**. Each learning should:
- State what was learned clearly and concisely
- Briefly explain why it matters or how it's relevant
- Add context or detail where the raw notes are sparse

Output only a markdown bullet list. Use bold for the learning itself and regular text for the explanation. No headings, no summary, no title, no action items — just the bullet points.

${wrapUserData(rawNotes)}`,
	};
}
