"use client";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(
	() => import("@/components/layout/command-palette").then((m) => ({ default: m.CommandPalette })),
	{ ssr: false },
);

export function CommandPaletteLoader() {
	return <CommandPalette />;
}
