"use client";

import { useParams } from "next/navigation";
import { FormatForm } from "@/components/admin/format-form";
import { PageTransition } from "@/components/layout/page-transition";
import { Spinner } from "@/components/ui/spinner";
import { useFormats, useUpdateFormat } from "@/hooks/use-formats";

export default function EditFormatPage() {
	const { id } = useParams<{ id: string }>();
	const { data: formats, isLoading } = useFormats();
	const updateFormat = useUpdateFormat();

	const format = formats?.find((f) => f.id === id);

	if (isLoading) {
		return (
			<div className="flex justify-center py-24">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!format) {
		return <div className="py-24 text-center text-gray-400">Format not found</div>;
	}

	return (
		<PageTransition className="mx-auto max-w-2xl px-6 py-8">
			<h1 className="text-2xl font-bold text-gray-900">Edit Format</h1>
			<div className="mt-6">
				<FormatForm
					mode="edit"
					initialData={format}
					onSubmit={async (data) => {
						await updateFormat.mutateAsync({ id, ...data });
					}}
					isSubmitting={updateFormat.isPending}
				/>
			</div>
		</PageTransition>
	);
}
