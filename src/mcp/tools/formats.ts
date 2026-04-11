import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import { getAllFormats } from "@/lib/db/queries/formats";
import { error, success } from "../lib/responses";

export function registerFormatTools(server: McpServer) {
	server.registerTool(
		"list_formats",
		{
			title: "List Formats",
			description:
				"List all available activity formats (e.g. workshop, webinar, course). Use these IDs when creating or updating activities.",
			inputSchema: z.object({}),
		},
		async () => {
			try {
				const formats = await getAllFormats();
				return success(formats);
			} catch (err) {
				console.error("list_formats error:", err);
				return error("Failed to list formats");
			}
		},
	);
}
