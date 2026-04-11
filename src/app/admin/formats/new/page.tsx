"use client";

import { FormatForm } from "@/components/admin/format-form";
import { PageTransition } from "@/components/layout/page-transition";
import { useCreateFormat } from "@/hooks/use-formats";

export default function NewFormatPage() {
	const createFormat = useCreateFormat();

	return (
		<PageTransition className="mx-auto max-w-2xl px-6 py-8">
			<h1 className="text-2xl font-bold text-gray-900">New Format</h1>
			<div className="mt-6">
				<FormatForm
					mode="create"
					onSubmit={async (data) => {
						await createFormat.mutateAsync(data);
					}}
					isSubmitting={createFormat.isPending}
				/>
			</div>
		</PageTransition>
	);
}
