import { describe, expect, it, vi } from "vitest";
import { toastError, toastSuccess, toastUpdate } from "./toasts";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		warning: vi.fn(),
		error: vi.fn(),
	},
}));

describe("toast helpers", () => {
	it("toastSuccess calls toast.success", async () => {
		const { toast } = await import("sonner");
		toastSuccess("Created");
		expect(toast.success).toHaveBeenCalledWith("Created");
	});

	it("toastUpdate calls toast.warning", async () => {
		const { toast } = await import("sonner");
		toastUpdate("Updated");
		expect(toast.warning).toHaveBeenCalledWith("Updated");
	});

	it("toastError calls toast.error", async () => {
		const { toast } = await import("sonner");
		toastError("Failed");
		expect(toast.error).toHaveBeenCalledWith("Failed");
	});
});
