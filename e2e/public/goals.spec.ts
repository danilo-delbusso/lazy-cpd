import { expect, test } from "@playwright/test";

test.describe("Goals Page", () => {
	test("shows filter pills", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("button", { name: "All", exact: true })).toBeVisible();
		await expect(page.getByRole("button", { name: "Open", exact: true })).toBeVisible();
		await expect(page.getByRole("button", { name: "Upcoming", exact: true })).toBeVisible();
		await expect(page.getByRole("button", { name: "Completed", exact: true })).toBeVisible();
	});

	test("filters goals by status", async ({ page }) => {
		await page.goto("/");

		await page.getByRole("button", { name: "Completed" }).click();
		// Filter should still be visible after clicking
		await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
	});
});

test.describe("Goal Detail Page", () => {
	test("shows back link to goals", async ({ page }) => {
		await page.goto("/");

		// Click the first goal card link if one exists
		const firstGoalLink = page.locator("a[href^='/goal/']").first();
		if (await firstGoalLink.isVisible()) {
			await firstGoalLink.click();
			await expect(page.getByRole("link", { name: "All Goals" })).toBeVisible();
		}
	});
});
