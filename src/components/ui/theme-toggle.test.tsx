import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

const { useTheme } = vi.hoisted(() => ({
	useTheme: vi.fn(() => ({ theme: "system", resolvedTheme: "light", setTheme: vi.fn() })),
}));
vi.mock("@/hooks/use-theme", () => ({ useTheme }));

describe("ThemeToggle", () => {
	it("switches to dark when the resolved theme is light", async () => {
		const setTheme = vi.fn();
		useTheme.mockReturnValue({ theme: "light", resolvedTheme: "light", setTheme });
		render(<ThemeToggle />);
		await userEvent.click(screen.getByRole("button"));
		expect(setTheme).toHaveBeenCalledWith("dark");
	});

	it("switches to light when the resolved theme is dark", async () => {
		const setTheme = vi.fn();
		useTheme.mockReturnValue({ theme: "dark", resolvedTheme: "dark", setTheme });
		render(<ThemeToggle />);
		await userEvent.click(screen.getByRole("button"));
		expect(setTheme).toHaveBeenCalledWith("light");
	});
});
