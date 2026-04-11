import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./spinner";

describe("Spinner", () => {
	it("renders with status role", () => {
		render(<Spinner />);
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("has accessible label", () => {
		render(<Spinner />);
		expect(screen.getByLabelText("Loading")).toBeInTheDocument();
	});

	it("applies animate-spin class", () => {
		render(<Spinner />);
		const svg = screen.getByRole("status");
		expect(svg.classList.contains("animate-spin")).toBe(true);
	});

	it("applies size classes", () => {
		const { rerender } = render(<Spinner size="sm" />);
		expect(screen.getByRole("status").classList.contains("h-4")).toBe(true);

		rerender(<Spinner size="lg" />);
		expect(screen.getByRole("status").classList.contains("h-8")).toBe(true);
	});
});
