/**
 * Deep-serialize an object, converting Date instances to ISO strings.
 *
 * Server components return Drizzle models with Date objects, but the API
 * (and TanStack Query refetches) return ISO strings. This ensures
 * initialData from server components matches the shape of client fetches.
 */
export function serializeDates<T>(value: T): T {
	if (value === null || value === undefined) return value;
	if (value instanceof Date) return value.toISOString() as T;
	if (Array.isArray(value)) return value.map(serializeDates) as T;
	if (typeof value === "object") {
		const result: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) {
			result[k] = serializeDates(v);
		}
		return result as T;
	}
	return value;
}
