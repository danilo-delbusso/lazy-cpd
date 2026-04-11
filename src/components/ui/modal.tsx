"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children?: ReactNode;
	confirmLabel?: string;
	confirmVariant?: "primary" | "danger";
	onConfirm?: () => void;
	loading?: boolean;
}

export function Modal({
	open,
	onClose,
	title,
	description,
	children,
	confirmLabel = "Confirm",
	confirmVariant = "primary",
	onConfirm,
	loading,
}: ModalProps) {
	// Close on Escape
	useEffect(() => {
		if (!open) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/30 backdrop-blur-sm"
						onClick={onClose}
						aria-hidden="true"
					/>

					{/* Dialog */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="relative z-10 w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-xl"
						role="dialog"
						aria-modal="true"
						aria-labelledby="modal-title"
					>
						<h2 id="modal-title" className="text-lg font-semibold text-stone-900">
							{title}
						</h2>
						{description && <p className="mt-2 text-sm text-stone-500">{description}</p>}
						{children && <div className="mt-4">{children}</div>}

						{onConfirm && (
							<div className="mt-6 flex justify-end gap-3">
								<Button variant="ghost" onClick={onClose} disabled={loading}>
									Cancel
								</Button>
								<Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
									{confirmLabel}
								</Button>
							</div>
						)}
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
