import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
	if (!client) {
		const apiKey = process.env.ANTHROPIC_API_KEY;
		if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
		client = new Anthropic({ apiKey });
	}
	return client;
}

export const AI_MODELS = {
	fast: "claude-haiku-4-5-20251001",
	quality: "claude-sonnet-4-5-20250929",
} as const;

export function isAIConfigured(): boolean {
	return !!process.env.ANTHROPIC_API_KEY;
}
