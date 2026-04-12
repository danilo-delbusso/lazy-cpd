import { expect, test } from "@playwright/test";

// Auth tests need their OWN browser context (no shared storageState)
// so they can test the unauthenticated → authenticated flow.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Admin Authentication", () => {
	test("redirects to login when not authenticated", async ({ page }) => {
		await page.goto("/admin");
		await expect(page).toHaveURL(/\/admin\/login/);
	});

	test("shows login form", async ({ page }) => {
		await page.goto("/admin/login");
		await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible();
		await expect(page.getByLabel("Password")).toBeVisible();
		await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
	});

	test("shows error on invalid credentials", async ({ page }) => {
		await page.goto("/admin/login");
		await page.getByLabel("Password").fill("wrong-password");
		await page.getByRole("button", { name: /sign in/i }).click();

		// Should show an error toast
		await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 5000 });
	});

	test("successful login redirects to admin dashboard", async ({ page }) => {
		await page.goto("/admin/login");
		await page
			.getByLabel("Password")
			.fill(process.env.ADMIN_PASSWORD ?? "local-dev-password-change-me");
		await page.getByRole("button", { name: /sign in/i }).click();

		await expect(page).toHaveURL("/admin", { timeout: 10000 });
		await expect(page.getByText(/welcome back/i)).toBeVisible();
	});

	test("admin pages are accessible when logged in", async ({ page }) => {
		// Login first
		await page.goto("/admin/login");
		await page
			.getByLabel("Password")
			.fill(process.env.ADMIN_PASSWORD ?? "local-dev-password-change-me");
		await page.getByRole("button", { name: /sign in/i }).click();
		await expect(page).toHaveURL("/admin", { timeout: 10000 });

		// Navigate to goals management via the nav bar
		await page.getByRole("navigation").getByRole("link", { name: "Goals" }).click();
		await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();
	});
});
