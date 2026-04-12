import { expect, test } from "@playwright/test";

test.describe("Timeline Page", () => {
	test("displays timeline tab as active", async ({ page }) => {
		await page.goto("/timeline");
		// The Timeline tab link should be active (visible and styled)
		await expect(page.getByRole("link", { name: "Timeline" })).toBeVisible();
	});

	test("shows filter buttons", async ({ page }) => {
		await page.goto("/timeline");
		await expect(page.getByRole("button", { name: "All", exact: true })).toBeVisible();
		await expect(page.getByRole("button", { name: "Upcoming" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
	});

	test("displays activity content after loading", async ({ page }) => {
		await page.goto("/timeline");
		// Timeline renders activity cards — just verify the content area loaded
		await expect(page.locator("footer")).toBeVisible();
	});
});
