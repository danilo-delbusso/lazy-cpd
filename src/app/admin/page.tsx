"use client";

import Link from "next/link";
import { useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { useGoals } from "@/hooks/use-goals";

export default function AdminDashboard() {
	const { data: goals } = useGoals();

	const totalActivities = goals?.reduce((sum, g) => sum + g.totalActivities, 0) ?? 0;
	const openGoals = goals?.filter((g) => g.status === "open").length ?? 0;
	const completedGoals = goals?.filter((g) => g.status === "completed").length ?? 0;

	return (
		<PageTransition className="mx-auto max-w-5xl px-6 py-8">
			<h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
			<p className="mt-1 text-sm text-stone-500">Welcome back</p>

			{/* Stats */}
			<div className="mt-6 grid gap-4 sm:grid-cols-4">
				<StatCard label="Total Goals" value={goals?.length ?? 0} />
				<StatCard label="Open Goals" value={openGoals} />
				<StatCard label="Completed" value={completedGoals} />
				<StatCard label="Activities" value={totalActivities} />
			</div>

			{/* MCP Connection */}
			<McpDetails />

			{/* Quick actions */}
			<div className="mt-8 grid gap-4 sm:grid-cols-3">
				<QuickAction
					href="/admin/goals"
					title="Goals"
					description="Manage CPD goals and tags"
					count={goals?.length}
				/>
				<QuickAction
					href="/admin/activities"
					title="Activities"
					description="Manage activity records"
					count={totalActivities}
				/>
				<QuickAction href="/admin/formats" title="Formats" description="Manage activity formats" />
			</div>
		</PageTransition>
	);
}

function McpDetails() {
	const [copied, setCopied] = useState<string | null>(null);
	const baseUrl =
		typeof window !== "undefined"
			? `${window.location.protocol}//${window.location.host}`
			: "http://localhost:3000";
	const mcpUrl = `${baseUrl}/api/mcp`;

	const addCommand = `claude mcp add -s user --transport http cpd-portal ${mcpUrl} --header "Authorization: Bearer \${CPD_MCP_TOKEN}"`;

	const jsonConfig = JSON.stringify(
		{
			mcpServers: {
				"cpd-portal": {
					type: "http",
					url: mcpUrl,
					headers: { Authorization: "Bearer ${CPD_MCP_TOKEN}" },
				},
			},
		},
		null,
		2,
	);

	function copy(text: string, label: string) {
		navigator.clipboard.writeText(text);
		setCopied(label);
		setTimeout(() => setCopied(null), 2000);
	}

	return (
		<div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
			<h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">MCP Server</h2>
			<p className="mt-1 text-xs text-stone-400">
				Connect Claude Code to manage goals and activities via MCP tools
			</p>

			<div className="mt-4 space-y-3">
				<McpField
					label="Endpoint"
					value={mcpUrl}
					onCopy={() => copy(mcpUrl, "endpoint")}
					copied={copied === "endpoint"}
				/>
				<McpField
					label="Health Check"
					value={`curl ${mcpUrl}`}
					onCopy={() => copy(`curl ${mcpUrl}`, "health")}
					copied={copied === "health"}
				/>

				<div>
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-stone-500">CLI Setup</span>
						<CopyButton onClick={() => copy(addCommand, "cli")} copied={copied === "cli"} />
					</div>
					<pre className="mt-1 overflow-x-auto rounded-lg bg-stone-50 p-3 text-xs text-stone-700">
						{addCommand}
					</pre>
				</div>

				<div>
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-stone-500">JSON Config</span>
						<CopyButton onClick={() => copy(jsonConfig, "json")} copied={copied === "json"} />
					</div>
					<pre className="mt-1 overflow-x-auto rounded-lg bg-stone-50 p-3 text-xs text-stone-700">
						{jsonConfig}
					</pre>
				</div>

				<p className="text-xs text-stone-400">
					Set <code className="rounded bg-stone-100 px-1 py-0.5 text-stone-600">CPD_MCP_TOKEN</code>{" "}
					in your shell profile. Generate with:{" "}
					<code className="rounded bg-stone-100 px-1 py-0.5 text-stone-600">
						openssl rand -hex 32
					</code>
				</p>
			</div>
		</div>
	);
}

function McpField({
	label,
	value,
	onCopy,
	copied,
}: {
	label: string;
	value: string;
	onCopy: () => void;
	copied: boolean;
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="min-w-0 flex-1">
				<span className="text-xs font-medium text-stone-500">{label}</span>
				<p className="truncate font-mono text-sm text-stone-700">{value}</p>
			</div>
			<CopyButton onClick={onCopy} copied={copied} />
		</div>
	);
}

function CopyButton({ onClick, copied }: { onClick: () => void; copied: boolean }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="shrink-0 rounded-md border border-stone-200 px-2 py-1 text-xs text-stone-500 transition-colors hover:bg-stone-50"
		>
			{copied ? "Copied" : "Copy"}
		</button>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
			<p className="text-xs font-medium uppercase tracking-wider text-stone-400">{label}</p>
			<p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
		</div>
	);
}

function QuickAction({
	href,
	title,
	description,
	count,
}: {
	href: string;
	title: string;
	description: string;
	count?: number;
}) {
	return (
		<Link
			href={href}
			className="group rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
		>
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-stone-900 group-hover:text-amber-700">{title}</h3>
				{count !== undefined && (
					<span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
						{count}
					</span>
				)}
			</div>
			<p className="mt-1 text-sm text-stone-500">{description}</p>
		</Link>
	);
}
