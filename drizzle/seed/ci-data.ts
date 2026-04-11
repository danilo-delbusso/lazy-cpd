import { createId } from "@paralleldrive/cuid2";
import type { NewActivity, NewActivityFormat, NewGoal } from "../../src/lib/db/schema";

// --- Activity Formats ---

export const formatSeeds: NewActivityFormat[] = [
	{ id: createId(), name: "BCS Webinar", slug: "bcs_webinar", color: "#2563eb", sortOrder: 0 },
	{ id: createId(), name: "Webinar", slug: "webinar", color: "#7c3aed", sortOrder: 1 },
	{
		id: createId(),
		name: "Online Resource",
		slug: "online_resource",
		color: "#059669",
		sortOrder: 2,
	},
	{ id: createId(), name: "Online Course", slug: "online_course", color: "#0891b2", sortOrder: 3 },
	{ id: createId(), name: "Practical", slug: "practical", color: "#d97706", sortOrder: 4 },
	{ id: createId(), name: "Conference", slug: "conference", color: "#dc2626", sortOrder: 5 },
	{ id: createId(), name: "Book", slug: "book", color: "#4f46e5", sortOrder: 6 },
	{ id: createId(), name: "Audio Book", slug: "audio_book", color: "#9333ea", sortOrder: 7 },
	{ id: createId(), name: "E-book", slug: "ebook", color: "#6366f1", sortOrder: 8 },
	{ id: createId(), name: "Existing Role", slug: "existing_role", color: "#64748b", sortOrder: 9 },
	{
		id: createId(),
		name: "University Paper",
		slug: "university_paper",
		color: "#0d9488",
		sortOrder: 10,
	},
];

// --- Goals ---

const goalIds = Array.from({ length: 12 }, () => createId());

export const goalSeeds: NewGoal[] = [
	{
		id: goalIds[0],
		title: "Learn About Cloud-Native Architecture",
		description:
			"Research and understand cloud-native patterns including microservices, containers, serverless, and service mesh architectures to improve distributed system design skills.",
		status: "open",
		tags: ["infrastructure", "system design", "cloud"],
		sortOrder: 0,
	},
	{
		id: goalIds[1],
		title: "Master TypeScript Advanced Patterns",
		description:
			"Deepen understanding of TypeScript's type system including conditional types, mapped types, template literal types, and variance to write more type-safe applications.",
		status: "open",
		tags: ["programming", "typescript", "deep skills"],
		sortOrder: 1,
	},
	{
		id: goalIds[2],
		title: "Understand Machine Learning Fundamentals",
		description:
			"Build foundational knowledge of ML concepts including supervised/unsupervised learning, neural networks, and practical applications in software engineering.",
		status: "open",
		tags: ["machine learning", "data", "deep skills"],
		sortOrder: 2,
	},
	{
		id: goalIds[3],
		title: "Explore Data Engineering Practices",
		description:
			"Study modern data engineering practices including data pipelines, ETL processes, data lakes, and real-time streaming architectures.",
		status: "upcoming",
		tags: ["data", "infrastructure", "deep skills"],
		sortOrder: 3,
	},
	{
		id: goalIds[4],
		title: "Improve Security Engineering Knowledge",
		description:
			"Learn about application security, OWASP top 10, threat modelling, and security-by-design principles to build more secure systems.",
		status: "upcoming",
		tags: ["security", "deep skills"],
		sortOrder: 4,
	},
	{
		id: goalIds[5],
		title: "Study System Design Principles",
		description:
			"Research system design patterns including scalability, reliability, availability, and performance optimisation for large-scale distributed systems.",
		status: "completed",
		tags: ["system design", "architecture", "deep skills"],
		sortOrder: 5,
	},
	{
		id: goalIds[6],
		title: "Learn About Observability and Monitoring",
		description:
			"Understand the three pillars of observability (logs, metrics, traces), and learn tools and practices for effective system monitoring.",
		status: "completed",
		tags: ["observability", "infrastructure", "devops"],
		sortOrder: 6,
	},
	{
		id: goalIds[7],
		title: "Develop Leadership and Mentoring Skills",
		description:
			"Improve technical leadership capabilities including code review practices, mentoring junior engineers, and leading architecture discussions.",
		status: "open",
		tags: ["leadership", "soft skills", "mentoring"],
		sortOrder: 7,
	},
	{
		id: goalIds[8],
		title: "Explore Edge Computing and IoT",
		description:
			"Research edge computing paradigms, IoT protocols, and the intersection of cloud and edge for latency-sensitive applications.",
		status: "upcoming",
		tags: ["infrastructure", "IoT", "cloud"],
		sortOrder: 8,
	},
	{
		id: goalIds[9],
		title: "Master Database Internals",
		description:
			"Study how databases work under the hood including storage engines, query optimisers, transaction isolation, and consensus algorithms.",
		status: "open",
		tags: ["databases", "deep skills", "system design"],
		sortOrder: 9,
	},
	{
		id: goalIds[10],
		title: "Learn About WebAssembly",
		description:
			"Understand WebAssembly concepts, toolchains, and use cases for high-performance web applications and server-side workloads.",
		status: "upcoming",
		tags: ["programming", "web platform", "deep skills"],
		sortOrder: 10,
	},
	{
		id: goalIds[11],
		title: "General Growth of Knowledge",
		description:
			"Ongoing broad learning across technology topics including conferences, podcasts, articles, and community engagement.",
		status: "open",
		tags: ["general", "community", "broad learning"],
		sortOrder: 11,
	},
];

// --- Activities ---

/** Generate a date relative to today */
function daysAgo(n: number): Date {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d;
}

function generateActivities(): NewActivity[] {
	const acts: NewActivity[] = [];
	const statuses = ["upcoming", "in_progress", "completed"] as const;

	// Goal 0: Cloud-Native — 8 activities
	const g0Activities = [
		{
			title: "Kubernetes Fundamentals Workshop",
			days: 5,
			format: 3,
			status: 1,
			tags: ["cloud & infrastructure", "distributed systems"],
		},
		{
			title: "CNCF Webinar: Service Mesh Deep Dive",
			days: 20,
			format: 1,
			status: 2,
			tags: ["cloud & infrastructure", "distributed systems"],
		},
		{
			title: "Docker and Container Best Practices",
			days: 35,
			format: 2,
			status: 2,
			tags: ["cloud & infrastructure"],
		},
		{
			title: "Serverless Architecture Patterns",
			days: 50,
			format: 3,
			status: 2,
			tags: ["cloud & infrastructure", "data architecture"],
		},
		{
			title: "Cloud-Native Security Considerations",
			days: 65,
			format: 0,
			status: 2,
			tags: ["cloud & infrastructure", "privacy & security"],
		},
		{
			title: "Microservices Communication Patterns",
			days: 80,
			format: 6,
			status: 2,
			tags: ["distributed systems", "api design"],
		},
		{
			title: "Building Resilient Distributed Systems",
			days: 95,
			format: 2,
			status: 2,
			tags: ["distributed systems", "cloud & infrastructure"],
		},
		{
			title: "Cloud Provider Comparison Study",
			days: 110,
			format: 2,
			status: 2,
			tags: ["cloud & infrastructure"],
		},
	];
	for (const a of g0Activities) {
		acts.push({
			id: createId(),
			goalId: goalIds[0],
			title: a.title,
			fullDate: daysAgo(a.days),
			status: statuses[a.status],
			formatId: formatSeeds[a.format].id,
			notes: `Notes on ${a.title} covering key concepts and takeaways.`,
			references: null,
			tags: a.tags,
		});
	}

	// Goal 1: TypeScript — 15 activities
	const tsActivities = [
		{ title: "Conditional Types", tags: ["programming", "deep skills"] },
		{ title: "Mapped Types", tags: ["programming", "deep skills"] },
		{ title: "Template Literal Types", tags: ["programming", "deep skills"] },
		{ title: "Variance and Covariance", tags: ["programming", "deep skills"] },
		{ title: "Type Guards and Narrowing", tags: ["programming"] },
		{ title: "Declaration Merging", tags: ["programming"] },
		{ title: "Module Augmentation", tags: ["programming"] },
		{ title: "Branded Types", tags: ["programming", "deep skills"] },
		{ title: "Type-Level Programming", tags: ["programming", "deep skills"] },
		{ title: "Compiler API Basics", tags: ["programming"] },
		{ title: "Project References", tags: ["programming"] },
		{ title: "Path Mapping Strategies", tags: ["programming"] },
		{ title: "Strict Mode Deep Dive", tags: ["programming", "deep skills"] },
		{ title: "Performance Optimisation", tags: ["programming", "performance & benchmarking"] },
		{ title: "TypeScript 5.x New Features", tags: ["programming"] },
	];
	for (let i = 0; i < tsActivities.length; i++) {
		acts.push({
			id: createId(),
			goalId: goalIds[1],
			title: tsActivities[i].title,
			fullDate: daysAgo(i * 12 + 3),
			status: i < 2 ? "in_progress" : "completed",
			formatId: formatSeeds[i % 3 === 0 ? 2 : i % 3 === 1 ? 6 : 3].id,
			notes:
				i % 2 === 0 ? `Detailed study of ${tsActivities[i].title} with practical exercises.` : null,
			references: i % 3 === 0 ? "TypeScript Handbook, Official Documentation" : null,
			tags: tsActivities[i].tags,
		});
	}

	// Goal 2: ML — 6 activities
	const mlActivities = [
		{ title: "Introduction to Neural Networks", tags: ["machine learning", "deep skills"] },
		{ title: "Supervised Learning Algorithms", tags: ["machine learning"] },
		{ title: "Unsupervised Learning Techniques", tags: ["machine learning"] },
		{ title: "ML in Production Systems", tags: ["machine learning", "cloud & infrastructure"] },
		{
			title: "Feature Engineering Best Practices",
			tags: ["machine learning", "data architecture"],
		},
		{ title: "Model Evaluation Metrics", tags: ["machine learning"] },
	];
	for (let i = 0; i < mlActivities.length; i++) {
		acts.push({
			id: createId(),
			goalId: goalIds[2],
			title: mlActivities[i].title,
			fullDate: daysAgo(i * 18 + 10),
			status: i < 1 ? "upcoming" : "completed",
			formatId: formatSeeds[i % 2 === 0 ? 3 : 1].id,
			notes: `Key learnings from ${mlActivities[i].title}.`,
			references: null,
			tags: mlActivities[i].tags,
		});
	}

	// Goal 3: Data Engineering — 3 activities (upcoming goal)
	for (let i = 0; i < 3; i++) {
		acts.push({
			id: createId(),
			goalId: goalIds[3],
			title: `Data Pipeline Architecture Part ${i + 1}`,
			fullDate: daysAgo(i * 25 + 2),
			status: "upcoming",
			formatId: formatSeeds[2].id,
			notes: null,
			references: null,
			tags: ["data architecture", "streaming & events"],
		});
	}

	// Goal 5: System Design (completed) — 20 activities
	const sdActivities = [
		{ title: "Load Balancing Strategies", tags: ["distributed systems", "cloud & infrastructure"] },
		{
			title: "Caching Layers and Strategies",
			tags: ["performance & benchmarking", "distributed systems"],
		},
		{ title: "Database Sharding Approaches", tags: ["databases", "distributed systems"] },
		{ title: "Message Queue Architectures", tags: ["streaming & events", "distributed systems"] },
		{ title: "CAP Theorem Deep Dive", tags: ["distributed systems", "deep skills"] },
		{ title: "Consistent Hashing", tags: ["distributed systems", "deep skills"] },
		{ title: "Rate Limiting Design", tags: ["api design", "distributed systems"] },
		{ title: "API Gateway Patterns", tags: ["api design", "cloud & infrastructure"] },
		{ title: "Event-Driven Architecture", tags: ["streaming & events", "data architecture"] },
		{ title: "CQRS and Event Sourcing", tags: ["streaming & events", "data architecture"] },
		{ title: "Distributed Transactions", tags: ["distributed systems", "databases"] },
		{ title: "Circuit Breaker Pattern", tags: ["distributed systems"] },
		{ title: "Service Discovery", tags: ["distributed systems", "cloud & infrastructure"] },
		{ title: "Data Replication Strategies", tags: ["databases", "distributed systems"] },
		{ title: "Idempotency in Distributed Systems", tags: ["distributed systems", "api design"] },
		{ title: "Back-Pressure Handling", tags: ["streaming & events", "distributed systems"] },
		{
			title: "Geo-Distribution Strategies",
			tags: ["distributed systems", "cloud & infrastructure"],
		},
		{ title: "Multi-Tenancy Patterns", tags: ["data architecture", "cloud & infrastructure"] },
		{ title: "Zero-Downtime Deployments", tags: ["cloud & infrastructure"] },
		{
			title: "Capacity Planning Fundamentals",
			tags: ["cloud & infrastructure", "performance & benchmarking"],
		},
	];
	for (let i = 0; i < sdActivities.length; i++) {
		acts.push({
			id: createId(),
			goalId: goalIds[5],
			title: sdActivities[i].title,
			fullDate: daysAgo(i * 8 + 120),
			status: "completed",
			formatId: formatSeeds[i % 4 === 0 ? 0 : i % 4 === 1 ? 1 : i % 4 === 2 ? 6 : 2].id,
			notes: `Completed study of ${sdActivities[i].title}.`,
			references:
				i % 2 === 0 ? "System Design Interview, Designing Data-Intensive Applications" : null,
			tags: sdActivities[i].tags,
		});
	}

	// Goal 6: Observability (completed) — 10 activities
	const obsActivities = [
		{ title: "Structured Logging Best Practices", tags: ["cloud & infrastructure"] },
		{
			title: "Prometheus and Grafana Setup",
			tags: ["cloud & infrastructure", "performance & benchmarking"],
		},
		{
			title: "Distributed Tracing with OpenTelemetry",
			tags: ["distributed systems", "cloud & infrastructure"],
		},
		{
			title: "SLO/SLI Definition Workshop",
			tags: ["cloud & infrastructure", "process improvement"],
		},
		{ title: "Alert Design and Runbooks", tags: ["cloud & infrastructure"] },
		{ title: "Log Aggregation Pipelines", tags: ["cloud & infrastructure", "data architecture"] },
		{
			title: "Metrics Cardinality Management",
			tags: ["cloud & infrastructure", "performance & benchmarking"],
		},
		{
			title: "Observability-Driven Development",
			tags: ["cloud & infrastructure", "process improvement"],
		},
		{ title: "Incident Response Playbooks", tags: ["cloud & infrastructure", "management"] },
		{
			title: "Chaos Engineering Introduction",
			tags: ["distributed systems", "cloud & infrastructure"],
		},
	];
	for (let i = 0; i < obsActivities.length; i++) {
		acts.push({
			id: createId(),
			goalId: goalIds[6],
			title: obsActivities[i].title,
			fullDate: daysAgo(i * 10 + 200),
			status: "completed",
			formatId: formatSeeds[i % 3 === 0 ? 4 : i % 3 === 1 ? 1 : 0].id,
			notes: `Completed: ${obsActivities[i].title}.`,
			references: null,
			tags: obsActivities[i].tags,
		});
	}

	// Goal 7: Leadership — 4 activities
	const leadershipActivities = [
		{ title: "Code Review Workshop", tags: ["leadership", "process improvement"] },
		{ title: "Mentoring Session Framework", tags: ["leadership", "people & culture"] },
		{ title: "Architecture Decision Records", tags: ["leadership", "management"] },
		{ title: "Technical Writing for Engineers", tags: ["leadership", "management"] },
	];
	for (let i = 0; i < leadershipActivities.length; i++) {
		acts.push({
			id: createId(),
			goalId: goalIds[7],
			title: leadershipActivities[i].title,
			fullDate: daysAgo(i * 30 + 15),
			status: i < 2 ? "in_progress" : "completed",
			formatId: formatSeeds[i === 0 ? 4 : i === 1 ? 9 : 6].id,
			notes: null,
			references: null,
			tags: leadershipActivities[i].tags,
		});
	}

	// Goal 11: General — 1 activity (to test single-activity goals)
	acts.push({
		id: createId(),
		goalId: goalIds[11],
		title: "Annual Tech Conference Attendance",
		fullDate: daysAgo(45),
		status: "completed",
		formatId: formatSeeds[5].id,
		notes: "Attended talks on AI, distributed systems, and developer experience.",
		references: "Conference website",
		tags: ["emerging technology", "distributed systems"],
	});

	return acts;
}

export const activitySeeds = generateActivities();
