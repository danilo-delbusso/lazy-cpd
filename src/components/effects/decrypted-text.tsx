import type { HTMLMotionProps } from "motion/react";
import { motion } from "motion/react";
import { useDecryptedText } from "@/hooks/use-decrypted-text";

interface DecryptedTextProps extends HTMLMotionProps<"span"> {
	text: string;
	speed?: number;
	maxIterations?: number;
	sequential?: boolean;
	revealDirection?: "start" | "end" | "center";
	useOriginalCharsOnly?: boolean;
	characters?: string;
	className?: string;
	encryptedClassName?: string;
	parentClassName?: string;
	animateOn?: "view" | "hover" | "inViewHover" | "click";
	clickMode?: "once" | "toggle";
}

export function DecryptedText({
	text,
	speed,
	maxIterations,
	sequential,
	revealDirection,
	useOriginalCharsOnly,
	characters,
	className = "",
	parentClassName = "",
	encryptedClassName = "",
	animateOn = "hover",
	clickMode = "once",
	...props
}: Readonly<DecryptedTextProps>) {
	const {
		displayText,
		isAnimating,
		isDecrypted,
		revealedIndices,
		containerRef,
		triggerHoverDecrypt,
		resetToPlainText,
		handleClick,
	} = useDecryptedText({
		text,
		speed,
		maxIterations,
		sequential,
		revealDirection,
		useOriginalCharsOnly,
		characters,
		animateOn,
		clickMode,
	});

	const interactionProps = (() => {
		if (animateOn === "hover" || animateOn === "inViewHover") {
			return { onMouseEnter: triggerHoverDecrypt, onMouseLeave: resetToPlainText };
		}
		if (animateOn === "click") {
			return { onClick: handleClick };
		}
		return {};
	})();

	return (
		<motion.span
			ref={containerRef}
			className={`inline-block whitespace-pre-wrap ${parentClassName}`}
			{...interactionProps}
			{...props}
		>
			<span className="sr-only">{displayText}</span>
			<span aria-hidden="true">
				{displayText.split("").map((char, index) => {
					const isRevealed = revealedIndices.has(index) || (!isAnimating && isDecrypted);
					return (
						<span key={`c${index}`} className={isRevealed ? className : encryptedClassName}>
							{char}
						</span>
					);
				})}
			</span>
		</motion.span>
	);
}
