import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
	test("displays the hero section", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("heading", { name: /continuing professional/i })).toBeVisible();
		await expect(page.getByText(/tracking goals/i)).toBeVisible();
	});

	test("has navigation links", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("link", { name: "Goals" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Timeline" })).toBeVisible();
	});

	test("View Goals link navigates to goals page", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("link", { name: "View Goals" }).click();
		await expect(page).toHaveURL("/goals");
	});

	test("Browse Timeline link navigates to timeline page", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Browse Timeline" }).click();
		await expect(page).toHaveURL("/timeline");
	});

	test("displays stat cards", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("Goals")).toBeVisible();
		await expect(page.getByText("Activities")).toBeVisible();
	});

	test("footer is visible", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText(/built with next/i)).toBeVisible();
	});
});
