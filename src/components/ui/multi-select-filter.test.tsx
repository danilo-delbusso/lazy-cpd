import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelectFilter } from "./multi-select-filter";

const OPTIONS = [
	{ value: "a", label: "Option A" },
	{ value: "b", label: "Option B" },
];

describe("MultiSelectFilter", () => {
	it("shows a count badge once options are selected", () => {
		render(
			<MultiSelectFilter label="Status" options={OPTIONS} selected={["a"]} onChange={vi.fn()} />,
		);
		expect(screen.getByText("1")).toBeInTheDocument();
	});

	it("opens the option list and toggles a selection on click", async () => {
		const onChange = vi.fn();
		render(
			<MultiSelectFilter label="Status" options={OPTIONS} selected={[]} onChange={onChange} />,
		);
		await userEvent.click(screen.getByRole("button", { name: /status/i }));
		await userEvent.click(screen.getByRole("option", { name: "Option A" }));
		expect(onChange).toHaveBeenCalledWith(["a"]);
	});

	it("deselects an already selected option", async () => {
		const onChange = vi.fn();
		render(
			<MultiSelectFilter label="Status" options={OPTIONS} selected={["a"]} onChange={onChange} />,
		);
		await userEvent.click(screen.getByRole("button", { name: /status/i }));
		await userEvent.click(screen.getByRole("option", { name: "Option A" }));
		expect(onChange).toHaveBeenCalledWith([]);
	});

	it("clears the selection", async () => {
		const onChange = vi.fn();
		render(
			<MultiSelectFilter
				label="Status"
				options={OPTIONS}
				selected={["a", "b"]}
				onChange={onChange}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: /status/i }));
		await userEvent.click(screen.getByText("Clear"));
		expect(onChange).toHaveBeenCalledWith([]);
	});
});
