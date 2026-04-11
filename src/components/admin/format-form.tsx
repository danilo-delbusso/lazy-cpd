"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/validations/format";

interface FormatFormProps {
	mode: "create" | "edit";
	initialData?: {
		id: string;
		name: string;
		slug: string;
		color: string;
	};
	onSubmit: (data: { name: string; slug: string; color: string }) => Promise<void>;
	isSubmitting: boolean;
}

export function FormatForm({ mode, initialData, onSubmit, isSubmitting }: FormatFormProps) {
	const router = useRouter();
	const [name, setName] = useState(initialData?.name ?? "");
	const [color, setColor] = useState(initialData?.color ?? "#6366f1");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const slug = slugify(name);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const errs: Record<string, string> = {};
		if (name.length < 2) errs.name = "Name must be at least 2 characters";
		if (Object.keys(errs).length > 0) {
			setErrors(errs);
			return;
		}
		setErrors({});
		await onSubmit({ name, slug, color });
		router.push("/admin/formats");
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<label htmlFor="name" className="block text-sm font-medium text-gray-700">
					Name
				</label>
				<input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
				{slug && <p className="mt-1 text-xs text-gray-400">Slug: {slug}</p>}
			</div>

			<div>
				<label htmlFor="color" className="block text-sm font-medium text-gray-700">
					Color
				</label>
				<div className="mt-1 flex items-center gap-3">
					<input
						id="color"
						type="color"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						className="h-10 w-14 cursor-pointer rounded border border-gray-300"
					/>
					<input
						type="text"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						pattern="^#[0-9a-fA-F]{6}$"
						className="w-28 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>
			</div>

			{/* Preview */}
			{name && (
				<div>
					<p className="text-sm font-medium text-gray-700">Preview</p>
					<div className="mt-2">
						<Badge hex={color}>{name}</Badge>
					</div>
				</div>
			)}

			<div className="flex gap-3">
				<Button type="submit" loading={isSubmitting}>
					{mode === "create" ? "Create Format" : "Save Changes"}
				</Button>
				<Button type="button" variant="ghost" onClick={() => router.push("/admin/formats")}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
