import { McpServer } from "@modelcontextprotocol/server";
import { registerActivityTools } from "./tools/activities";
import { registerFormatTools } from "./tools/formats";
import { registerGoalTools } from "./tools/goals";
import { registerSearchTools } from "./tools/search";
import { registerStatsTools } from "./tools/stats";

/** Create and configure an MCP server with all CPD Portal tools registered. */
export function createMcpServer(): McpServer {
	const server = new McpServer({
		name: "cpd-portal",
		version: "1.0.0",
	});

	registerGoalTools(server);
	registerActivityTools(server);
	registerFormatTools(server);
	registerSearchTools(server);
	registerStatsTools(server);

	return server;
}
