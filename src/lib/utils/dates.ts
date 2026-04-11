/** Format a date as DD MMM YYYY (e.g. "03 Apr 2026") */
export function formatDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

/** Format a date as YYYY-MM-DD for form inputs */
export function toInputDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toISOString().split("T")[0];
}
