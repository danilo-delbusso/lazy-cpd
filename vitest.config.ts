import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.test.{ts,tsx}"],
		alias: {
			"@/": new URL("./src/", import.meta.url).pathname,
		},
		coverage: {
			provider: "v8",
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/test/**", "src/**/*.d.ts", "src/**/*.test.{ts,tsx}"],
			thresholds: {
				statements: 80,
				branches: 80,
				functions: 80,
				lines: 80,
			},
		},
	},
});
