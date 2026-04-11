"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAIStreamReturn {
	data: string;
	isStreaming: boolean;
	error: string | null;
	start: (url: string, body: Record<string, unknown>) => void;
	abort: () => void;
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

				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() ?? "";

					for (const line of lines) {
						if (!line.startsWith("data: ")) continue;
						const payload = line.slice(6).trim();
						if (payload === "[DONE]") continue;

						try {
							const parsed = JSON.parse(payload);
							if (parsed.error) {
								setError(parsed.error);
							} else if (parsed.text) {
								setData((prev) => prev + parsed.text);
							}
						} catch {
							// skip malformed chunks
						}
					}
				}
			} catch (err) {
				if (err instanceof DOMException && err.name === "AbortError") {
					// user cancelled — not an error
				} else {
					setError(err instanceof Error ? err.message : "Stream failed");
				}
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
