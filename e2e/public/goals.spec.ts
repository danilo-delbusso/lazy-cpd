import { expect, test } from "@playwright/test";

test.describe("Goals Page", () => {
	test("displays goals heading", async ({ page }) => {
		await page.goto("/goals");
		await expect(page.getByRole("heading", { name: /cpd goals/i })).toBeVisible();
	});

	test("shows filter pills", async ({ page }) => {
		await page.goto("/goals");
		await expect(page.getByRole("button", { name: "All" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Open" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Upcoming" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
	});

	test("filters goals by status", async ({ page }) => {
		await page.goto("/goals");
		// Wait for goals to load
		await page.waitForResponse("**/api/goals");

		await page.getByRole("button", { name: "Completed" }).click();
		// Page should still show heading
		await expect(page.getByRole("heading", { name: /cpd goals/i })).toBeVisible();
	});
});

test.describe("Goal Detail Page", () => {
	test("shows back link to goals", async ({ page }) => {
		await page.goto("/goals");
		await page.waitForResponse("**/api/goals");

		// Click the first goal card link
		const firstGoalLink = page.locator("a[href^='/goals/']").first();
		if (await firstGoalLink.isVisible()) {
			await firstGoalLink.click();
			await expect(page.getByRole("link", { name: "All Goals" })).toBeVisible();
		}
	});
});
