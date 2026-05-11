import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CommandPaletteLoader } from "@/components/layout/command-palette-loader";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const siteOwner = process.env.NEXT_PUBLIC_SITE_OWNER || "CPD Portal";

export const metadata: Metadata = {
	title: `CPD Portal — ${siteOwner}`,
	description:
		"Continuing Professional Development portfolio showcasing goals, activities, and learning progress.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			data-scroll-behavior="smooth"
			className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
			suppressHydrationWarning
		>
			<body className="min-h-full text-stone-900">
				<QueryProvider>
					{children}
					<CommandPaletteLoader />
					<ConfirmDialog />
					<ToastProvider />
				</QueryProvider>
			</body>
		</html>
	);
}
