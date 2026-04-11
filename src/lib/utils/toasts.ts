import { toast } from "sonner";

/** Green toast — use for successful create/add operations */
export function toastSuccess(message: string) {
	toast.success(message);
}

/** Orange toast — use for successful update operations */
export function toastUpdate(message: string) {
	toast.warning(message);
}

/** Red toast — use for delete confirmations and errors */
export function toastError(message: string) {
	toast.error(message);
}
