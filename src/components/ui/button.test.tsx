import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("renders children", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
	});

	it("applies primary variant by default", () => {
		render(<Button>Primary</Button>);
		const btn = screen.getByRole("button");
		expect(btn.className).toContain("bg-amber-600");
	});

	it("applies danger variant", () => {
		render(<Button variant="danger">Delete</Button>);
		const btn = screen.getByRole("button");
		expect(btn.className).toContain("bg-rose-600");
	});

	it("applies secondary variant", () => {
		render(<Button variant="secondary">Cancel</Button>);
		const btn = screen.getByRole("button");
		expect(btn.className).toContain("bg-stone-100");
	});

	it("applies ghost variant", () => {
		render(<Button variant="ghost">Ghost</Button>);
		const btn = screen.getByRole("button");
		expect(btn.className).toContain("text-stone-500");
	});

	it("applies size classes", () => {
		const { rerender } = render(<Button size="sm">Small</Button>);
		expect(screen.getByRole("button").className).toContain("text-xs");

		rerender(<Button size="lg">Large</Button>);
		expect(screen.getByRole("button").className).toContain("text-base");
	});

	it("handles click events", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(<Button onClick={onClick}>Click</Button>);
		await user.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("is disabled when disabled prop is set", () => {
		render(<Button disabled>Disabled</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("is disabled when loading", () => {
		render(<Button loading>Loading</Button>);
		const btn = screen.getByRole("button");
		expect(btn).toBeDisabled();
	});

	it("shows spinner when loading", () => {
		render(<Button loading>Loading</Button>);
		const svg = screen.getByRole("button").querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg?.classList.contains("animate-spin")).toBe(true);
	});

	it("does not fire click when disabled", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(
			<Button disabled onClick={onClick}>
				No click
			</Button>,
		);
		await user.click(screen.getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("merges custom className", () => {
		render(<Button className="custom-class">Styled</Button>);
		expect(screen.getByRole("button").className).toContain("custom-class");
	});

	it("forwards ref", () => {
		const ref = vi.fn();
		render(<Button ref={ref}>Ref</Button>);
		expect(ref).toHaveBeenCalled();
	});
});
