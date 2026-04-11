import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardBody, CardFooter, CardHeader } from "./card";

describe("Card", () => {
	it("renders children", () => {
		render(<Card>Card content</Card>);
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("applies hover classes when hover prop is true", () => {
		const { container } = render(<Card hover>Hoverable</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain("hover:-translate-y-0.5");
		expect(card.className).toContain("hover:shadow-md");
	});

	it("does not apply hover classes by default", () => {
		const { container } = render(<Card>Static</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).not.toContain("hover:-translate-y-0.5");
	});

	it("merges custom className", () => {
		const { container } = render(<Card className="p-8">Custom</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain("p-8");
	});
});

describe("CardHeader", () => {
	it("renders with border bottom", () => {
		const { container } = render(<CardHeader>Header</CardHeader>);
		const el = container.firstChild as HTMLElement;
		expect(el.className).toContain("border-b");
		expect(screen.getByText("Header")).toBeInTheDocument();
	});
});

describe("CardBody", () => {
	it("renders with padding", () => {
		const { container } = render(<CardBody>Body</CardBody>);
		const el = container.firstChild as HTMLElement;
		expect(el.className).toContain("px-6");
		expect(screen.getByText("Body")).toBeInTheDocument();
	});
});

describe("CardFooter", () => {
	it("renders with border top", () => {
		const { container } = render(<CardFooter>Footer</CardFooter>);
		const el = container.firstChild as HTMLElement;
		expect(el.className).toContain("border-t");
		expect(screen.getByText("Footer")).toBeInTheDocument();
	});
});
