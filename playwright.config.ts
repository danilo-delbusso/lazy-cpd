import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",

	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.05,
		},
	},

	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	projects: [
		// Auth setup — logs in once and saves cookies
		{ name: "setup", testMatch: /auth\.setup\.ts/ },

		// Public pages — no auth needed, both browsers
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			testIgnore: /admin\//,
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
			testIgnore: /admin\//,
		},

		// Admin pages — reuse authenticated session, chromium only
		{
			name: "chromium-admin",
			use: {
				...devices["Desktop Chrome"],
				storageState: "e2e/.auth/admin.json",
			},
			testMatch: /admin\//,
			dependencies: ["setup"],
		},
	],

	webServer: {
		command: process.env.CI ? "node .next/standalone/server.js" : "bun run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
