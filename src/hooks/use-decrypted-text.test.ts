import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDecryptedText } from "./use-decrypted-text";

describe("useDecryptedText", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("initialises with the original text for non-click mode", () => {
		const { result } = renderHook(() =>
			useDecryptedText({ text: "Hello", animateOn: "hover" }),
		);
		expect(result.current.displayText).toBe("Hello");
		expect(result.current.isDecrypted).toBe(true);
		expect(result.current.isAnimating).toBe(false);
	});

	it("initialises encrypted for click mode", () => {
		const { result } = renderHook(() =>
			useDecryptedText({ text: "Hello", animateOn: "click" }),
		);
		// In click mode, text is shuffled immediately so it shouldn't match the original
		// (unless extremely unlikely random match). The length should be preserved.
		expect(result.current.displayText.length).toBe(5);
		expect(result.current.isDecrypted).toBe(false);
	});

	it("preserves spaces during encryption", () => {
		const { result } = renderHook(() =>
			useDecryptedText({ text: "Hi There", animateOn: "click" }),
		);
		// Space at index 2 should be preserved
		expect(result.current.displayText[2]).toBe(" ");
	});

	it("triggerHoverDecrypt starts animation", () => {
		const { result } = renderHook(() =>
			useDecryptedText({ text: "Test", animateOn: "hover", speed: 50, maxIterations: 3 }),
		);

		act(() => {
			result.current.triggerHoverDecrypt();
		});

		expect(result.current.isAnimating).toBe(true);
	});

	it("sequential forward animation reveals all chars and stops", () => {
		const { result } = renderHook(() =>
			useDecryptedText({
				text: "AB",
				animateOn: "hover",
				speed: 10,
				sequential: true,
				revealDirection: "start",
			}),
		);

		act(() => {
			result.current.triggerHoverDecrypt();
		});

		// Tick enough intervals to reveal all characters (2 chars)
		act(() => {
			vi.advanceTimersByTime(100);
		});

		expect(result.current.isAnimating).toBe(false);
		expect(result.current.isDecrypted).toBe(true);
	});

	it("random forward animation completes after maxIterations", () => {
		const { result } = renderHook(() =>
			useDecryptedText({
				text: "Hello",
				animateOn: "hover",
				speed: 10,
				maxIterations: 5,
				sequential: false,
			}),
		);

		act(() => {
			result.current.triggerHoverDecrypt();
		});

		// 5 iterations * 10ms = 50ms should complete
		act(() => {
			vi.advanceTimersByTime(200);
		});

		expect(result.current.isAnimating).toBe(false);
		expect(result.current.displayText).toBe("Hello");
		expect(result.current.isDecrypted).toBe(true);
	});

	it("resetToPlainText stops animation and shows original text", () => {
		const { result } = renderHook(() =>
			useDecryptedText({ text: "Reset", animateOn: "hover", speed: 10, maxIterations: 100 }),
		);

		act(() => {
			result.current.triggerHoverDecrypt();
		});

		expect(result.current.isAnimating).toBe(true);

		act(() => {
			result.current.resetToPlainText();
		});

		expect(result.current.isAnimating).toBe(false);
		expect(result.current.displayText).toBe("Reset");
		expect(result.current.isDecrypted).toBe(true);
	});

	it("handleClick in 'once' mode triggers decrypt only when not decrypted", () => {
		const { result } = renderHook(() =>
			useDecryptedText({
				text: "Click",
				animateOn: "click",
				clickMode: "once",
				speed: 10,
				maxIterations: 3,
			}),
		);

		expect(result.current.isDecrypted).toBe(false);

		act(() => {
			result.current.handleClick();
		});

		expect(result.current.isAnimating).toBe(true);

		// Complete animation
		act(() => {
			vi.advanceTimersByTime(200);
		});

		expect(result.current.isDecrypted).toBe(true);

		// Clicking again should NOT re-animate
		act(() => {
			result.current.handleClick();
		});

		expect(result.current.isAnimating).toBe(false);
	});

	it("handleClick in 'toggle' mode toggles between encrypt and decrypt", () => {
		const { result } = renderHook(() =>
			useDecryptedText({
				text: "Toggle",
				animateOn: "click",
				clickMode: "toggle",
				speed: 10,
				maxIterations: 3,
				sequential: false,
			}),
		);

		// Initially encrypted -> click to decrypt
		act(() => {
			result.current.handleClick();
		});
		expect(result.current.isAnimating).toBe(true);

		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current.isDecrypted).toBe(true);

		// Now click to encrypt (reverse)
		act(() => {
			result.current.handleClick();
		});
		expect(result.current.isAnimating).toBe(true);

		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current.isDecrypted).toBe(false);
	});

	it("handleClick does nothing when animateOn is not 'click'", () => {
		const { result } = renderHook(() =>
			useDecryptedText({ text: "NoClick", animateOn: "hover" }),
		);

		act(() => {
			result.current.handleClick();
		});

		expect(result.current.isAnimating).toBe(false);
	});

	it("useOriginalCharsOnly limits character set to original text chars", () => {
		const { result } = renderHook(() =>
			useDecryptedText({
				text: "AB CD",
				animateOn: "click",
				useOriginalCharsOnly: true,
			}),
		);

		// All non-space chars in displayText should be from the set {A, B, C, D}
		const nonSpaceChars = result.current.displayText.replace(/ /g, "").split("");
		const allowed = new Set(["A", "B", "C", "D"]);
		for (const ch of nonSpaceChars) {
			expect(allowed.has(ch)).toBe(true);
		}
	});

	it("revealDirection 'end' reveals from the end in sequential mode", () => {
		const { result } = renderHook(() =>
			useDecryptedText({
				text: "XY",
				animateOn: "hover",
				speed: 10,
				sequential: true,
				revealDirection: "end",
			}),
		);

		act(() => {
			result.current.triggerHoverDecrypt();
		});

		// After enough time, both chars should be revealed
		act(() => {
			vi.advanceTimersByTime(100);
		});

		expect(result.current.isAnimating).toBe(false);
		expect(result.current.isDecrypted).toBe(true);
	});

	it("revealDirection 'center' works in sequential mode", () => {
		const { result } = renderHook(() =>
			useDecryptedText({
				text: "ABCDE",
				animateOn: "hover",
				speed: 10,
				sequential: true,
				revealDirection: "center",
			}),
		);

		act(() => {
			result.current.triggerHoverDecrypt();
		});

		act(() => {
			vi.advanceTimersByTime(200);
		});

		expect(result.current.isAnimating).toBe(false);
		expect(result.current.isDecrypted).toBe(true);
	});

	it("containerRef is available", () => {
		const { result } = renderHook(() =>
			useDecryptedText({ text: "Ref", animateOn: "hover" }),
		);
		expect(result.current.containerRef).toBeDefined();
		expect(result.current.containerRef.current).toBeNull();
	});
});
