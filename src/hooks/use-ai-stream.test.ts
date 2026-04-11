import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAIStream } from "./use-ai-stream";

function makeSSEStream(chunks: string[]): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	return new ReadableStream({
		start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(encoder.encode(chunk));
			}
			controller.close();
		},
	});
}

describe("useAIStream", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("starts with initial state", () => {
		const { result } = renderHook(() => useAIStream());
		expect(result.current.data).toBe("");
		expect(result.current.isStreaming).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it("streams text from SSE response", async () => {
		const stream = makeSSEStream([
			'data: {"text":"Hello"}\n\n',
			'data: {"text":" World"}\n\n',
			"data: [DONE]\n\n",
		]);

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			body: stream,
		} as unknown as Response);

		const { result } = renderHook(() => useAIStream());

		await act(async () => {
			result.current.start("/api/ai", { prompt: "test" });
		});

		await waitFor(() => expect(result.current.isStreaming).toBe(false));
		expect(result.current.data).toBe("Hello World");
		expect(result.current.error).toBeNull();
	});

	it("handles SSE error payloads", async () => {
		const stream = makeSSEStream(['data: {"error":"Rate limited"}\n\n']);

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			body: stream,
		} as unknown as Response);

		const { result } = renderHook(() => useAIStream());

		await act(async () => {
			result.current.start("/api/ai", { prompt: "test" });
		});

		await waitFor(() => expect(result.current.isStreaming).toBe(false));
		expect(result.current.error).toBe("Rate limited");
	});

	it("handles non-ok response", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "Unauthorized" }),
		} as unknown as Response);

		const { result } = renderHook(() => useAIStream());

		await act(async () => {
			result.current.start("/api/ai", { prompt: "test" });
		});

		await waitFor(() => expect(result.current.isStreaming).toBe(false));
		expect(result.current.error).toBe("Unauthorized");
	});

	it("handles missing response body", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			body: null,
		} as unknown as Response);

		const { result } = renderHook(() => useAIStream());

		await act(async () => {
			result.current.start("/api/ai", { prompt: "test" });
		});

		await waitFor(() => expect(result.current.isStreaming).toBe(false));
		expect(result.current.error).toBe("No response stream");
	});

	it("resets state when start is called again", async () => {
		const stream1 = makeSSEStream(['data: {"text":"First"}\n\n']);
		const stream2 = makeSSEStream(['data: {"text":"Second"}\n\n']);

		vi.mocked(fetch)
			.mockResolvedValueOnce({ ok: true, body: stream1 } as unknown as Response)
			.mockResolvedValueOnce({ ok: true, body: stream2 } as unknown as Response);

		const { result } = renderHook(() => useAIStream());

		await act(async () => {
			result.current.start("/api/ai", { prompt: "1" });
		});

		await waitFor(() => expect(result.current.data).toBe("First"));

		await act(async () => {
			result.current.start("/api/ai", { prompt: "2" });
		});

		await waitFor(() => expect(result.current.data).toBe("Second"));
	});

	it("skips malformed SSE chunks", async () => {
		const stream = makeSSEStream([
			'data: {"text":"OK"}\n\n',
			"data: {broken json}\n\n",
			'data: {"text":"!"}\n\n',
		]);

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			body: stream,
		} as unknown as Response);

		const { result } = renderHook(() => useAIStream());

		await act(async () => {
			result.current.start("/api/ai", { prompt: "test" });
		});

		await waitFor(() => expect(result.current.isStreaming).toBe(false));
		expect(result.current.data).toBe("OK!");
	});
});
