vi.mock("server-only", () => ({}));

import { createId } from "@paralleldrive/cuid2";
import { afterAll, describe, expect, it } from "vitest";
import {
	createFormat,
	deleteFormat,
	getAllFormats,
	getFormatActivityCount,
	getFormatById,
	updateFormat,
} from "./formats";
import { createGoal, deleteGoal } from "./goals";
import { createActivity, deleteActivity } from "./activities";

const TEST_PREFIX = `test-fmt-${Date.now()}`;
const formatIds: string[] = [];
const goalIds: string[] = [];
const activityIds: string[] = [];

describe("formats queries", () => {
	afterAll(async () => {
		for (const id of activityIds) {
			await deleteActivity(id).catch(() => {});
		}
		for (const id of goalIds) {
			await deleteGoal(id).catch(() => {});
		}
		for (const id of formatIds) {
			await deleteFormat(id).catch(() => {});
		}
	});

	it("createFormat inserts a format and returns it", async () => {
		const id = createId();
		formatIds.push(id);

		const format = await createFormat({
			id,
			name: `${TEST_PREFIX} Workshop`,
			slug: `${TEST_PREFIX}_workshop`,
			color: "#ff0000",
			sortOrder: 5,
		});

		expect(format.id).toBe(id);
		expect(format.name).toBe(`${TEST_PREFIX} Workshop`);
		expect(format.slug).toBe(`${TEST_PREFIX}_workshop`);
		expect(format.color).toBe("#ff0000");
		expect(format.sortOrder).toBe(5);
		expect(format.createdAt).toBeInstanceOf(Date);
	});

	it("getFormatById returns the created format", async () => {
		const format = await getFormatById(formatIds[0]);
		expect(format).toBeDefined();
		expect(format!.id).toBe(formatIds[0]);
	});

	it("getFormatById returns undefined for non-existent id", async () => {
		const format = await getFormatById("non-existent-format-xyz");
		expect(format).toBeUndefined();
	});

	it("getAllFormats returns formats with activity counts", async () => {
		const formats = await getAllFormats();
		const testFormat = formats.find((f) => f.id === formatIds[0]);

		expect(testFormat).toBeDefined();
		expect(testFormat!.activityCount).toBe(0);
	});

	it("createFormat rejects duplicate slug", async () => {
		const id = createId();
		await expect(
			createFormat({
				id,
				name: `${TEST_PREFIX} Workshop Dupe`,
				slug: `${TEST_PREFIX}_workshop`, // same slug as first
				color: "#00ff00",
			}),
		).rejects.toThrow();
	});

	it("updateFormat modifies fields", async () => {
		const updated = await updateFormat(formatIds[0], {
			name: `${TEST_PREFIX} Workshop Updated`,
			color: "#0000ff",
		});

		expect(updated).toBeDefined();
		expect(updated!.name).toBe(`${TEST_PREFIX} Workshop Updated`);
		expect(updated!.color).toBe("#0000ff");
	});

	it("updateFormat returns undefined for non-existent id", async () => {
		const result = await updateFormat("non-existent-format-xyz", { name: "Nope" });
		expect(result).toBeUndefined();
	});

	it("getFormatActivityCount returns 0 when no activities", async () => {
		const count = await getFormatActivityCount(formatIds[0]);
		expect(count).toBe(0);
	});

	it("deleteFormat throws when activities reference it", async () => {
		// Create a goal and activity referencing this format
		const gId = createId();
		const aId = createId();
		goalIds.push(gId);
		activityIds.push(aId);

		await createGoal({
			id: gId,
			title: `${TEST_PREFIX} Goal for format delete test`,
			description: "Testing format delete restriction",
		});
		await createActivity({
			id: aId,
			goalId: gId,
			title: `${TEST_PREFIX} Activity for format`,
			fullDate: new Date("2025-08-01"),
			status: "upcoming",
			formatId: formatIds[0],
			tags: [],
		});

		await expect(deleteFormat(formatIds[0])).rejects.toThrow("Cannot delete format");
	});

	it("getFormatActivityCount returns correct count", async () => {
		const count = await getFormatActivityCount(formatIds[0]);
		expect(count).toBe(1);
	});

	it("deleteFormat succeeds when no activities reference it", async () => {
		const id = createId();
		formatIds.push(id);

		await createFormat({
			id,
			name: `${TEST_PREFIX} Deletable`,
			slug: `${TEST_PREFIX}_deletable`,
			color: "#abcdef",
		});

		const deleted = await deleteFormat(id);
		expect(deleted).toBe(true);

		// Remove from cleanup list since it's already deleted
		formatIds.splice(formatIds.indexOf(id), 1);
	});

	it("deleteFormat returns false for non-existent id", async () => {
		const result = await deleteFormat("non-existent-format-xyz");
		expect(result).toBe(false);
	});
});
