import { expect, test } from "@playwright/test";

test.describe("Visual Regression @visual", () => {
	test("homepage", async ({ page }) => {
		await page.goto("/");
		// Wait for animations to settle
		await page.waitForTimeout(1000);
		await expect(page).toHaveScreenshot("homepage.png", {
			fullPage: true,
			maxDiffPixels: 50,
		});
	});

	test("goals page", async ({ page }) => {
		await page.goto("/goals");
		await page.waitForResponse("**/api/goals");
		await page.waitForTimeout(500);
		await expect(page).toHaveScreenshot("goals-page.png", {
			fullPage: true,
			maxDiffPixels: 50,
		});
	});

	test("timeline page", async ({ page }) => {
		await page.goto("/timeline");
		await page.waitForResponse("**/api/activities*");
		await page.waitForTimeout(500);
		await expect(page).toHaveScreenshot("timeline-page.png", {
			fullPage: true,
			maxDiffPixels: 50,
		});
	});

	test("login page", async ({ page }) => {
		await page.goto("/admin/login");
		await page.waitForTimeout(500);
		await expect(page).toHaveScreenshot("login-page.png", {
			maxDiffPixels: 50,
		});
	});
});
