import { AI_MODELS, getAnthropicClient } from "../anthropic.server";
import { expandNotesPrompt } from "../prompts";

export function expandNotesStream(rawNotes: string, activityTitle: string, goalTitle?: string) {
	const anthropic = getAnthropicClient();
	const { system, user } = expandNotesPrompt(rawNotes, activityTitle, goalTitle);

	return anthropic.messages.stream({
		model: AI_MODELS.quality,
		max_tokens: 1000,
		system,
		messages: [{ role: "user", content: user }],
	});
}
