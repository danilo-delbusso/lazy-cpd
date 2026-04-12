import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
	test("displays the site header", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("CPD")).toBeVisible();
		await expect(page.getByText("Portal")).toBeVisible();
	});

	test("has navigation tabs", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("link", { name: "Goals" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Timeline" })).toBeVisible();
	});

	test("Goals tab navigates to goals (homepage)", async ({ page }) => {
		await page.goto("/timeline");
		await page.getByRole("link", { name: "Goals" }).click();
		await expect(page).toHaveURL("/");
	});

	test("Timeline tab navigates to timeline page", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Timeline" }).click();
		await expect(page).toHaveURL("/timeline");
	});

	test("footer is visible", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText(/built by/i)).toBeVisible();
	});
});
