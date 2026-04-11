import { expect, test } from "@playwright/test";

test.describe("Timeline Page", () => {
	test("displays timeline heading", async ({ page }) => {
		await page.goto("/timeline");
		await expect(page.getByRole("heading", { name: /activity timeline/i })).toBeVisible();
	});

	test("shows filter dropdowns", async ({ page }) => {
		await page.goto("/timeline");
		// Status filter
		await expect(page.locator("select").first()).toBeVisible();
	});

	test("displays activity cards after loading", async ({ page }) => {
		await page.goto("/timeline");
		await page.waitForResponse("**/api/activities*");
		// Timeline should show either activities or a no-results message
		const hasContent =
			(await page.locator("[class*='rounded-lg border']").count()) > 0 ||
			(await page
				.getByText("No activities found")
				.isVisible()
				.catch(() => false));
		expect(hasContent).toBeTruthy();
	});
});
