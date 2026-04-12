import { expect, test } from "@playwright/test";

// These tests run with storageState from the setup project — already authenticated.

test.describe("Admin Goals CRUD", () => {
	test("can navigate to goals management", async ({ page }) => {
		await page.goto("/admin");
		await page.getByRole("navigation").getByRole("link", { name: "Goals" }).click();
		await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Add Goal" })).toBeVisible();
	});

	test("can open new goal form", async ({ page }) => {
		await page.goto("/admin/goals");
		await page.getByRole("link", { name: "Add Goal" }).click();
		await expect(page).toHaveURL("/admin/goals/new");
		await expect(page.getByRole("heading", { name: "New Goal" })).toBeVisible();
	});

	test("validates goal form fields", async ({ page }) => {
		await page.goto("/admin/goals/new");
		// Submit empty form
		await page.getByRole("button", { name: /create goal/i }).click();
		// Should show validation errors
		await expect(page.getByText(/at least 3 characters/i)).toBeVisible();
	});
});

test.describe("Admin Activities CRUD", () => {
	test("can navigate to activities management", async ({ page }) => {
		await page.goto("/admin/activities");
		await expect(page.getByRole("heading", { name: "Activities" })).toBeVisible();
	});

	test("can open new activity form", async ({ page }) => {
		await page.goto("/admin/activities");
		await page.getByRole("link", { name: "Add Activity" }).click();
		await expect(page).toHaveURL("/admin/activities/new");
		await expect(page.getByRole("heading", { name: "New Activity" })).toBeVisible();
	});
});

test.describe("Admin Formats CRUD", () => {
	test("can navigate to formats management", async ({ page }) => {
		await page.goto("/admin/formats");
		await expect(page.getByRole("heading", { name: "Activity Formats" })).toBeVisible();
	});

	test("can open new format form", async ({ page }) => {
		await page.goto("/admin/formats");
		await page.getByRole("link", { name: "Add Format" }).click();
		await expect(page).toHaveURL("/admin/formats/new");
		await expect(page.getByRole("heading", { name: "New Format" })).toBeVisible();
	});

	test("shows format preview in form", async ({ page }) => {
		await page.goto("/admin/formats/new");
		await page.getByLabel("Name").fill("Test Format");
		await expect(page.getByText("Preview")).toBeVisible();
		await expect(page.getByText("Test Format")).toBeVisible();
	});
});
