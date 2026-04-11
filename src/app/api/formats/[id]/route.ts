import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { deleteFormat, getFormatActivityCount, updateFormat } from "@/lib/db/queries/formats";
import { formatUpdateSchema } from "@/lib/validations/format";

export const PUT = withAuth(async (request, context) => {
	const { id } = await context.params;
	const body = await request.json().catch(() => null);
	const parsed = formatUpdateSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const format = await updateFormat(id, parsed.data);
	if (!format) {
		return NextResponse.json({ error: "Format not found" }, { status: 404 });
	}

	return NextResponse.json(format);
});

export const DELETE = withAuth(async (_request, context) => {
	const { id } = await context.params;

	try {
		const deleted = await deleteFormat(id);
		if (!deleted) {
			return NextResponse.json({ error: "Format not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true });
	} catch (err) {
		if (err instanceof Error && err.message.includes("Cannot delete format")) {
			const count = await getFormatActivityCount(id);
			return NextResponse.json({ error: err.message, activityCount: count }, { status: 409 });
		}
		throw err;
	}
});
