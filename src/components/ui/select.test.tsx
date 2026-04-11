import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./select";

const options = [
	{ value: "open", label: "Open" },
	{ value: "upcoming", label: "Upcoming" },
	{ value: "completed", label: "Completed" },
];

describe("Select", () => {
	it("renders with label", () => {
		render(<Select label="Status" options={options} />);
		expect(screen.getByLabelText("Status")).toBeInTheDocument();
	});

	it("renders all options", () => {
		render(<Select label="Status" options={options} />);
		expect(screen.getAllByRole("option")).toHaveLength(3);
	});

	it("renders placeholder when provided", () => {
		render(<Select label="Status" options={options} placeholder="Choose..." />);
		expect(screen.getByText("Choose...")).toBeInTheDocument();
		expect(screen.getAllByRole("option")).toHaveLength(4);
	});

	it("shows error message", () => {
		render(<Select label="Status" options={options} error="Required" />);
		expect(screen.getByText("Required")).toBeInTheDocument();
	});

	it("handles selection change", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<Select label="Status" options={options} onChange={onChange} />);
		await user.selectOptions(screen.getByLabelText("Status"), "completed");
		expect(onChange).toHaveBeenCalled();
	});
});
