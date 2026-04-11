/** Build a successful MCP tool response */
export function success(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

/** Build an error MCP tool response (generic message — never leak internals) */
export function error(message: string) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
		isError: true as const,
	};
}
