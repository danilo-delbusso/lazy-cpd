import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";

export async function GET() {
	const rows = await db
		.selectDistinct({ tag: sql<string>`unnest(${goals.tags})` })
		.from(goals)
		.orderBy(sql`1`);
	const tags = rows.map((r) => r.tag);
	return NextResponse.json(tags, {
		headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
	});
}
