import type { NextConfig } from "next";

const securityHeaders = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-XSS-Protection", value: "0" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
	{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
	{
		key: "Content-Security-Policy",
		value: [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob:",
			"font-src 'self' https://fonts.gstatic.com",
			"connect-src 'self'",
			"frame-ancestors 'none'",
		].join("; "),
	},
];

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		optimizePackageImports: [
			"motion",
			"@uiw/react-md-editor",
			"react-markdown",
			"@tanstack/react-query",
			"react-plock",
			"spring-animator",
		],
	},
	headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
};

export default nextConfig;
