import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "./badge";

const { useDarkMode } = vi.hoisted(() => ({ useDarkMode: vi.fn(() => false) }));
vi.mock("@/hooks/use-dark-mode", () => ({ useDarkMode }));

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

	it("uses a tinted style for a hex that contrasts with a light background", () => {
		useDarkMode.mockReturnValue(false);
		render(<Badge hex="#dc2626">Red</Badge>);
		const el = screen.getByText("Red");
		expect(el.style.backgroundColor).not.toBe("rgb(220, 38, 38)");
		expect(el.style.color).toBe("rgb(220, 38, 38)");
	});

	it("falls back to a solid filled chip for a dark hex on a dark background", () => {
		useDarkMode.mockReturnValue(true);
		render(<Badge hex="#000000">Black</Badge>);
		const el = screen.getByText("Black");
		expect(el.style.backgroundColor).toBe("rgb(0, 0, 0)");
		expect(el.style.color).toBe("rgb(250, 250, 249)");
	});

	it("falls back to a solid filled chip for a light hex on a light background", () => {
		useDarkMode.mockReturnValue(false);
		render(<Badge hex="#ffffff">White</Badge>);
		const el = screen.getByText("White");
		expect(el.style.backgroundColor).toBe("rgb(255, 255, 255)");
		expect(el.style.color).toBe("rgb(28, 25, 23)");
	});

	it("keeps the tinted style for a dark hex on a light background", () => {
		useDarkMode.mockReturnValue(false);
		render(<Badge hex="#000000">Black on light</Badge>);
		const el = screen.getByText("Black on light");
		expect(el.style.backgroundColor).not.toBe("rgb(0, 0, 0)");
		expect(el.style.color).toBe("rgb(0, 0, 0)");
	});
});
