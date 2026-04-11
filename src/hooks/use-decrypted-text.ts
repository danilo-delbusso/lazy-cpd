import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Direction = "forward" | "reverse";

interface UseDecryptedTextOptions {
	text: string;
	speed?: number;
	maxIterations?: number;
	sequential?: boolean;
	revealDirection?: "start" | "end" | "center";
	useOriginalCharsOnly?: boolean;
	characters?: string;
	animateOn?: "view" | "hover" | "inViewHover" | "click";
	clickMode?: "once" | "toggle";
}

export function useDecryptedText({
	text,
	speed = 50,
	maxIterations = 10,
	sequential = false,
	revealDirection = "start",
	useOriginalCharsOnly = false,
	characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
	animateOn = "hover",
	clickMode = "once",
}: UseDecryptedTextOptions) {
	const [displayText, setDisplayText] = useState<string>(text);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);
	const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
	const [hasAnimated, setHasAnimated] = useState<boolean>(false);
	const [isDecrypted, setIsDecrypted] = useState<boolean>(animateOn !== "click");
	const [direction, setDirection] = useState<Direction>("forward");

	const containerRef = useRef<HTMLSpanElement>(null);
	const orderRef = useRef<number[]>([]);
	const pointerRef = useRef<number>(0);

	const availableChars = useMemo<string[]>(() => {
		return useOriginalCharsOnly
			? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
			: characters.split("");
	}, [useOriginalCharsOnly, text, characters]);

	const shuffleText = useCallback(
		(originalText: string, currentRevealed: Set<number>) => {
			return originalText
				.split("")
				.map((char, i) => {
					if (char === " ") return " ";
					if (currentRevealed.has(i)) return originalText[i];
					return availableChars[Math.floor(Math.random() * availableChars.length)];
				})
				.join("");
		},
		[availableChars],
	);

	const computeOrder = useCallback(
		(len: number): number[] => {
			const order: number[] = [];
			if (len <= 0) return order;
			if (revealDirection === "start") {
				for (let i = 0; i < len; i++) order.push(i);
				return order;
			}
			if (revealDirection === "end") {
				for (let i = len - 1; i >= 0; i--) order.push(i);
				return order;
			}
			const middle = Math.floor(len / 2);
			let offset = 0;
			while (order.length < len) {
				if (offset % 2 === 0) {
					const idx = middle + offset / 2;
					if (idx >= 0 && idx < len) order.push(idx);
				} else {
					const idx = middle - Math.ceil(offset / 2);
					if (idx >= 0 && idx < len) order.push(idx);
				}
				offset++;
			}
			return order.slice(0, len);
		},
		[revealDirection],
	);

	const fillAllIndices = useCallback((): Set<number> => {
		const s = new Set<number>();
		for (let i = 0; i < text.length; i++) s.add(i);
		return s;
	}, [text]);

	const removeRandomIndices = useCallback((set: Set<number>, count: number): Set<number> => {
		const arr = Array.from(set);
		for (let i = 0; i < count && arr.length > 0; i++) {
			const idx = Math.floor(Math.random() * arr.length);
			arr.splice(idx, 1);
		}
		return new Set(arr);
	}, []);

	const encryptInstantly = useCallback(() => {
		const emptySet = new Set<number>();
		setRevealedIndices(emptySet);
		setDisplayText(shuffleText(text, emptySet));
		setIsDecrypted(false);
	}, [text, shuffleText]);

	const triggerDecrypt = useCallback(() => {
		if (sequential) {
			orderRef.current = computeOrder(text.length);
			pointerRef.current = 0;
			setRevealedIndices(new Set());
		} else {
			setRevealedIndices(new Set());
		}
		setDirection("forward");
		setIsAnimating(true);
	}, [sequential, computeOrder, text.length]);

	const triggerReverse = useCallback(() => {
		if (sequential) {
			orderRef.current = computeOrder(text.length).slice().reverse();
			pointerRef.current = 0;
			setRevealedIndices(fillAllIndices());
			setDisplayText(shuffleText(text, fillAllIndices()));
		} else {
			setRevealedIndices(fillAllIndices());
			setDisplayText(shuffleText(text, fillAllIndices()));
		}
		setDirection("reverse");
		setIsAnimating(true);
	}, [sequential, computeOrder, fillAllIndices, shuffleText, text]);

	// Main animation loop
	useEffect(() => {
		if (!isAnimating) return;

		let currentIteration = 0;

		const getNextIndex = (revealedSet: Set<number>): number => {
			const textLength = text.length;
			if (revealDirection === "start") return revealedSet.size;
			if (revealDirection === "end") return textLength - 1 - revealedSet.size;
			const middle = Math.floor(textLength / 2);
			const offset = Math.floor(revealedSet.size / 2);
			const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
			if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) return nextIndex;
			for (let i = 0; i < textLength; i++) {
				if (!revealedSet.has(i)) return i;
			}
			return 0;
		};

		const interval = setInterval(() => {
			setRevealedIndices((prev) => {
				if (sequential) {
					if (direction === "forward") {
						if (prev.size < text.length) {
							const next = new Set(prev);
							next.add(getNextIndex(prev));
							setDisplayText(shuffleText(text, next));
							return next;
						}
						clearInterval(interval);
						setIsAnimating(false);
						setIsDecrypted(true);
						return prev;
					}
					if (direction === "reverse") {
						if (pointerRef.current < orderRef.current.length) {
							const next = new Set(prev);
							next.delete(orderRef.current[pointerRef.current++]);
							setDisplayText(shuffleText(text, next));
							if (next.size === 0) {
								clearInterval(interval);
								setIsAnimating(false);
								setIsDecrypted(false);
							}
							return next;
						}
						clearInterval(interval);
						setIsAnimating(false);
						setIsDecrypted(false);
						return prev;
					}
				} else {
					if (direction === "forward") {
						setDisplayText(shuffleText(text, prev));
						currentIteration++;
						if (currentIteration >= maxIterations) {
							clearInterval(interval);
							setIsAnimating(false);
							setDisplayText(text);
							setIsDecrypted(true);
						}
						return prev;
					}
					if (direction === "reverse") {
						const currentSet = prev.size === 0 ? fillAllIndices() : prev;
						const removeCount = Math.max(1, Math.ceil(text.length / Math.max(1, maxIterations)));
						const nextSet = removeRandomIndices(currentSet, removeCount);
						setDisplayText(shuffleText(text, nextSet));
						currentIteration++;
						if (nextSet.size === 0 || currentIteration >= maxIterations) {
							clearInterval(interval);
							setIsAnimating(false);
							setIsDecrypted(false);
							setDisplayText(shuffleText(text, new Set()));
							return new Set();
						}
						return nextSet;
					}
				}
				return prev;
			});
		}, speed);
		return () => clearInterval(interval);
	}, [
		isAnimating,
		text,
		speed,
		maxIterations,
		sequential,
		revealDirection,
		shuffleText,
		direction,
		fillAllIndices,
		removeRandomIndices,
		characters,
		useOriginalCharsOnly,
	]);

	// View observer
	useEffect(() => {
		if (animateOn !== "view" && animateOn !== "inViewHover") return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && !hasAnimated) {
						triggerDecrypt();
						setHasAnimated(true);
					}
				}
			},
			{ threshold: 0.1 },
		);
		const el = containerRef.current;
		if (el) observer.observe(el);
		return () => {
			if (el) observer.unobserve(el);
		};
	}, [animateOn, hasAnimated, triggerDecrypt]);

	// Init
	useEffect(() => {
		if (animateOn === "click") {
			encryptInstantly();
		} else {
			setDisplayText(text);
			setIsDecrypted(true);
		}
		setRevealedIndices(new Set());
		setDirection("forward");
	}, [animateOn, text, encryptInstantly]);

	const triggerHoverDecrypt = useCallback(() => {
		if (isAnimating) return;
		setRevealedIndices(new Set());
		setIsDecrypted(false);
		setDisplayText(text);
		setDirection("forward");
		setIsAnimating(true);
	}, [isAnimating, text]);

	const resetToPlainText = useCallback(() => {
		setIsAnimating(false);
		setRevealedIndices(new Set());
		setDisplayText(text);
		setIsDecrypted(true);
		setDirection("forward");
	}, [text]);

	const handleClick = useCallback(() => {
		if (animateOn !== "click") return;
		if (clickMode === "once") {
			if (isDecrypted) return;
			triggerDecrypt();
		}
		if (clickMode === "toggle") {
			if (isDecrypted) triggerReverse();
			else triggerDecrypt();
		}
	}, [animateOn, clickMode, isDecrypted, triggerDecrypt, triggerReverse]);

	return {
		displayText,
		isAnimating,
		isDecrypted,
		revealedIndices,
		containerRef,
		triggerHoverDecrypt,
		resetToPlainText,
		handleClick,
	};
}
