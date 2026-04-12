import { expect, test as setup } from "@playwright/test";

const STORAGE_STATE = "e2e/.auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
	await page.goto("/admin/login");
	await page
		.getByLabel("Password")
		.fill(process.env.ADMIN_PASSWORD ?? "local-dev-password-change-me");
	await page.getByRole("button", { name: /sign in/i }).click();
	await expect(page).toHaveURL("/admin", { timeout: 10000 });

	await page.context().storageState({ path: STORAGE_STATE });
});
