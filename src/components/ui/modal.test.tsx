import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal";

// Mock motion/react to avoid animation issues in tests
vi.mock("motion/react", () => ({
	AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	motion: {
		div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
			<div {...props}>{children}</div>
		),
	},
}));

describe("Modal", () => {
	it("renders title and description when open", () => {
		render(
			<Modal
				open
				onClose={vi.fn()}
				title="Confirm Delete"
				description="This action cannot be undone."
			/>,
		);
		expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
		expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		render(<Modal open={false} onClose={vi.fn()} title="Hidden" />);
		expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
	});

	it("renders confirm and cancel buttons when onConfirm is provided", () => {
		render(
			<Modal open onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" confirmLabel="Delete" />,
		);
		expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
	});

	it("calls onConfirm when confirm button clicked", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		render(
			<Modal open onClose={vi.fn()} onConfirm={onConfirm} title="Confirm" confirmLabel="Yes" />,
		);
		await user.click(screen.getByRole("button", { name: "Yes" }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it("calls onClose when cancel button clicked", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		render(<Modal open onClose={onClose} onConfirm={vi.fn()} title="Confirm" />);
		await user.click(screen.getByRole("button", { name: "Cancel" }));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("calls onClose when Escape is pressed", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		render(<Modal open onClose={onClose} title="Escapable" />);
		await user.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("renders children content", () => {
		render(
			<Modal open onClose={vi.fn()} title="With Content">
				<p>Extra content here</p>
			</Modal>,
		);
		expect(screen.getByText("Extra content here")).toBeInTheDocument();
	});

	it("disables buttons when loading", () => {
		render(<Modal open onClose={vi.fn()} onConfirm={vi.fn()} title="Loading" loading />);
		expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
	});
});
