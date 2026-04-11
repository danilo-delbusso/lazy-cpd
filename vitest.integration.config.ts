import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["src/**/*.integration.test.ts"],
		setupFiles: ["dotenv/config"],
		alias: {
			"@/": new URL("./src/", import.meta.url).pathname,
		},
		coverage: {
			provider: "v8",
			reporter: ["lcov"],
			reportsDirectory: "coverage-integration",
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/test/**", "src/**/*.d.ts", "src/**/*.test.{ts,tsx}", "src/**/*.integration.test.ts"],
		},
		// Run serially — integration tests share a DB
		sequence: { concurrent: false },
		fileParallelism: false,
	},
});
