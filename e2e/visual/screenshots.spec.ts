import { expect, test } from "@playwright/test";

test.describe("Visual Regression @visual", () => {
	test("homepage", async ({ page }) => {
		await page.goto("/");
		// Wait for animations to settle
		await page.waitForTimeout(1000);
		await expect(page).toHaveScreenshot("homepage.png", {
			fullPage: true,
			maxDiffPixelRatio: 0.05,
		});
	});

	test("goals page", async ({ page }) => {
		await page.goto("/");
		await page.waitForTimeout(1000);
		await expect(page).toHaveScreenshot("goals-page.png", {
			fullPage: true,
			maxDiffPixelRatio: 0.05,
		});
	});

	test("timeline page", async ({ page }) => {
		await page.goto("/timeline");
		await page.waitForTimeout(1000);
		await expect(page).toHaveScreenshot("timeline-page.png", {
			fullPage: true,
			maxDiffPixelRatio: 0.05,
		});
	});

	test("login page", async ({ page }) => {
		await page.goto("/admin/login");
		await page.waitForTimeout(500);
		await expect(page).toHaveScreenshot("login-page.png", {
			maxDiffPixelRatio: 0.05,
		});
	});
});
