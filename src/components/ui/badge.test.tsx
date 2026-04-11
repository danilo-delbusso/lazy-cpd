import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
	it("renders children text", () => {
		render(<Badge>Active</Badge>);
		expect(screen.getByText("Active")).toBeInTheDocument();
	});

	it("applies default color classes when no props given", () => {
		render(<Badge>Default</Badge>);
		const el = screen.getByText("Default");
		expect(el.className).toContain("bg-stone-100");
		expect(el.className).toContain("text-stone-700");
	});

	it("applies custom colorClasses", () => {
		render(<Badge colorClasses="bg-blue-100 text-blue-800">Blue</Badge>);
		const el = screen.getByText("Blue");
		expect(el.className).toContain("bg-blue-100");
		expect(el.className).toContain("text-blue-800");
	});

	it("applies hex color as inline style", () => {
		render(<Badge hex="#dc2626">Red</Badge>);
		const el = screen.getByText("Red");
		expect(el.style.backgroundColor).toBeTruthy();
		expect(el.style.color).toBeTruthy();
	});

	it("hex overrides colorClasses", () => {
		render(
			<Badge hex="#059669" colorClasses="bg-red-100 text-red-800">
				Mixed
			</Badge>,
		);
		const el = screen.getByText("Mixed");
		expect(el.style.color).toBeTruthy();
		expect(el.className).not.toContain("bg-red-100");
	});

	it("merges custom className", () => {
		render(<Badge className="ml-2">Spaced</Badge>);
		expect(screen.getByText("Spaced").className).toContain("ml-2");
	});
});
