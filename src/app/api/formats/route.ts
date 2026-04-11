import { createId } from "@paralleldrive/cuid2";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createFormat, getAllFormats } from "@/lib/db/queries/formats";
import { formatSchema, slugify } from "@/lib/validations/format";

export async function GET() {
	const formats = await getAllFormats();
	return NextResponse.json(formats, {
		headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
	});
}

export const POST = withAuth(async (request) => {
	const body = await request.json().catch(() => null);
	const parsed = formatSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const slug = parsed.data.slug || slugify(parsed.data.name);
	const format = await createFormat({ id: createId(), ...parsed.data, slug });
	return NextResponse.json(format, { status: 201 });
});
