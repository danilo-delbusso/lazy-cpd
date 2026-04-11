import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input";

describe("Input", () => {
	it("renders with label", () => {
		render(<Input label="Email" />);
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
	});

	it("renders without label", () => {
		render(<Input placeholder="Type here" />);
		expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
	});

	it("shows error message", () => {
		render(<Input label="Name" error="Required" />);
		expect(screen.getByText("Required")).toBeInTheDocument();
		expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
	});

	it("shows helper text when no error", () => {
		render(<Input label="Name" helperText="Enter your full name" />);
		expect(screen.getByText("Enter your full name")).toBeInTheDocument();
	});

	it("hides helper text when error is shown", () => {
		render(<Input label="Name" error="Too short" helperText="Enter name" />);
		expect(screen.getByText("Too short")).toBeInTheDocument();
		expect(screen.queryByText("Enter name")).not.toBeInTheDocument();
	});

	it("applies error styling", () => {
		render(<Input label="Name" error="Bad" />);
		const input = screen.getByLabelText("Name");
		expect(input.className).toContain("border-red-300");
	});

	it("handles user input", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<Input label="Test" onChange={onChange} />);
		await user.type(screen.getByLabelText("Test"), "hello");
		expect(onChange).toHaveBeenCalledTimes(5);
	});

	it("forwards ref", () => {
		const ref = vi.fn();
		render(<Input ref={ref} />);
		expect(ref).toHaveBeenCalled();
	});
});
