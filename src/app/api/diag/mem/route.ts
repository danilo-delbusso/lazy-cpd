import { NextResponse } from "next/server";

// Diagnostic-only memory probe. Disabled unless DIAG_MEM=1 so it is inert in
// normal production. GET reports process.memoryUsage(); POST additionally runs
// a forced GC when the process was started with --expose-gc, which lets us tell
// a real JS-heap leak (heapUsed stays high after GC) apart from allocator/native
// retention (rss stays high while heapUsed drops).
export const dynamic = "force-dynamic";

function enabled(): boolean {
	return process.env.DIAG_MEM === "1";
}

function snapshot() {
	const m = process.memoryUsage();
	return {
		rss: m.rss,
		heapTotal: m.heapTotal,
		heapUsed: m.heapUsed,
		external: m.external,
		arrayBuffers: m.arrayBuffers,
	};
}

export function GET(): Response {
	if (!enabled()) return new Response(null, { status: 404 });
	return NextResponse.json({ ts: Date.now(), mem: snapshot() });
}

export function POST(): Response {
	if (!enabled()) return new Response(null, { status: 404 });
	const gc = (globalThis as { gc?: () => void }).gc;
	if (gc) gc();
	return NextResponse.json({ ts: Date.now(), gc: gc ? "ran" : "unavailable", mem: snapshot() });
}
