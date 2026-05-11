import { createId } from "@paralleldrive/cuid2";
import type { NewActivityFormat } from "../../src/lib/db/schema";

export const formatSeeds: NewActivityFormat[] = [
	{ id: createId(), name: "BCS Webinar", slug: "bcs_webinar", color: "#2563eb", sortOrder: 0 },
	{ id: createId(), name: "Webinar", slug: "webinar", color: "#7c3aed", sortOrder: 1 },
	{ id: createId(), name: "Online Resource", slug: "online_resource", color: "#059669", sortOrder: 2 },
	{ id: createId(), name: "Online Course", slug: "online_course", color: "#0891b2", sortOrder: 3 },
	{ id: createId(), name: "Practical", slug: "practical", color: "#d97706", sortOrder: 4 },
	{ id: createId(), name: "Conference", slug: "conference", color: "#dc2626", sortOrder: 5 },
	{ id: createId(), name: "Book", slug: "book", color: "#4f46e5", sortOrder: 6 },
	{ id: createId(), name: "Audio Book", slug: "audio_book", color: "#9333ea", sortOrder: 7 },
	{ id: createId(), name: "E-book", slug: "ebook", color: "#6366f1", sortOrder: 8 },
	{ id: createId(), name: "Existing Role", slug: "existing_role", color: "#64748b", sortOrder: 9 },
	{ id: createId(), name: "University Paper", slug: "university_paper", color: "#0d9488", sortOrder: 10 },
];
