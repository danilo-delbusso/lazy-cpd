"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAIStreamReturn {
	data: string;
	isStreaming: boolean;
	error: string | null;
	start: (url: string, body: Record<string, unknown>) => void;
	abort: () => void;
}

interface SSECallbacks {
	onText: (text: string) => void;
	onError: (error: string) => void;
}

function parseSSELine(line: string, callbacks: SSECallbacks): void {
	if (!line.startsWith("data: ")) return;

	const payload = line.slice(6).trim();
	if (payload === "[DONE]") return;

	try {
		const parsed = JSON.parse(payload);
		if (parsed.error) {
			callbacks.onError(parsed.error);
		} else if (parsed.text) {
			callbacks.onText(parsed.text);
		}
	} catch {
		// skip malformed chunks
	}
}

async function readSSEStream(
	reader: ReadableStreamDefaultReader<Uint8Array>,
	callbacks: SSECallbacks,
): Promise<void> {
	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";

		for (const line of lines) {
			parseSSELine(line, callbacks);
		}
	}
}

function handleStreamError(err: unknown, setError: (e: string) => void): void {
	if (err instanceof DOMException && err.name === "AbortError") return;
	setError(err instanceof Error ? err.message : "Stream failed");
}

export function useAIStream(): UseAIStreamReturn {
	const [data, setData] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const abort = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setIsStreaming(false);
	}, []);

	const start = useCallback(
		async (url: string, body: Record<string, unknown>) => {
			abort();
			setData("");
			setError(null);
			setIsStreaming(true);

			const controller = new AbortController();
			abortRef.current = controller;

			const callbacks: SSECallbacks = {
				onText: (text) => setData((prev) => prev + text),
				onError: (msg) => setError(msg),
			};

			try {
				const res = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
					signal: controller.signal,
				});

				if (!res.ok) {
					const err = await res.json().catch(() => ({ error: "Request failed" }));
					setError(err.error ?? "Request failed");
					setIsStreaming(false);
					return;
				}

				const reader = res.body?.getReader();
				if (!reader) {
					setError("No response stream");
					setIsStreaming(false);
					return;
				}

				await readSSEStream(reader, callbacks);
			} catch (err) {
				handleStreamError(err, (msg) => setError(msg));
			} finally {
				setIsStreaming(false);
				abortRef.current = null;
			}
		},
		[abort],
	);

	// Abort in-flight stream on unmount
	useEffect(() => () => abortRef.current?.abort(), []);

	return { data, isStreaming, error, start, abort };
}
