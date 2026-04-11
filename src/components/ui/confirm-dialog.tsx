"use client";

import { useUIStore } from "@/stores/ui-store";
import { Modal } from "./modal";

/** Global confirmation dialog — mount once in the root layout */
export function ConfirmDialog() {
	const modal = useUIStore((s) => s.confirmModal);
	const resolve = useUIStore((s) => s.resolveConfirm);

	if (!modal) return null;

	return (
		<Modal
			open
			title={modal.title}
			description={modal.description}
			confirmLabel={modal.confirmLabel ?? "Confirm"}
			confirmVariant={modal.variant ?? "primary"}
			onClose={() => resolve(false)}
			onConfirm={() => resolve(true)}
		/>
	);
}
