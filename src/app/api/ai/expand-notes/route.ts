import { NextResponse } from "next/server";
import { isAIConfigured } from "@/lib/ai/anthropic.server";
import { expandNotesStream } from "@/lib/ai/capabilities/expand-notes";
import { withAuth } from "@/lib/auth/middleware";

export const maxDuration = 60;

export const POST = withAuth(async (request) => {
	if (!isAIConfigured()) {
		return NextResponse.json(
			{ error: "AI is not configured. Set ANTHROPIC_API_KEY in environment." },
			{ status: 503 },
		);
	}

	const body = await request.json().catch(() => null);
	if (!body?.notes || !body?.activityTitle) {
		return NextResponse.json({ error: "notes and activityTitle are required" }, { status: 400 });
	}

	try {
		const stream = expandNotesStream(body.notes, body.activityTitle, body.goalTitle);
		const encoder = new TextEncoder();

		return new Response(
			new ReadableStream({
				async start(controller) {
					try {
						stream.on("text", (text) => {
							controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
						});
						await stream.finalMessage();
						controller.enqueue(encoder.encode("data: [DONE]\n\n"));
						controller.close();
					} catch (err) {
						console.error("expand-notes stream error:", err);
						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify({ error: "AI expansion failed" })}\n\n`),
						);
						controller.close();
					}
				},
			}),
			{
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			},
		);
	} catch (err) {
		console.error("expand-notes error:", err);
		return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
	}
});
