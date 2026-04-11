import { timingSafeEqual } from "node:crypto";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import { createMcpServer } from "@/mcp/server";

function isAuthorized(req: Request): boolean {
	const token = process.env.CPD_MCP_TOKEN;
	if (!token) return false;
	const auth = req.headers.get("authorization");
	if (!auth?.startsWith("Bearer ")) return false;
	const provided = Buffer.from(auth.slice(7));
	const expected = Buffer.from(token);
	if (provided.length !== expected.length) return false;
	return timingSafeEqual(provided, expected);
}

export async function POST(req: Request) {
	if (!isAuthorized(req)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const server = createMcpServer();
	const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
	await server.connect(transport);
	return transport.handleRequest(req);
}

export async function GET() {
	return Response.json({ status: "ok", service: "cpd-portal-mcp" });
}

export async function DELETE() {
	// Stateless mode — no sessions to tear down
	return new Response(null, { status: 405 });
}
