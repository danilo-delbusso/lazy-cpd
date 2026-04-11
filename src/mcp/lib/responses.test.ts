import { describe, expect, it } from "vitest";
import { error, success } from "./responses";

describe("success", () => {
	it("wraps data as a JSON text content block", () => {
		const data = { id: "abc", title: "Test Goal" };
		const result = success(data);

		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
		});
	});

	it("handles an empty object", () => {
		const result = success({});
		expect(result.content[0].text).toBe("{}");
	});

	it("handles an array", () => {
		const data = [1, 2, 3];
		const result = success(data);
		expect(JSON.parse(result.content[0].text)).toEqual([1, 2, 3]);
	});

	it("handles null", () => {
		const result = success(null);
		expect(result.content[0].text).toBe("null");
	});

	it("does not set isError", () => {
		const result = success("ok");
		expect(result).not.toHaveProperty("isError");
	});
});

describe("error", () => {
	it("wraps message in an error envelope with isError flag", () => {
		const result = error("Something went wrong");

		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify({ error: "Something went wrong" }) }],
			isError: true,
		});
	});

	it("sets isError to true", () => {
		const result = error("fail");
		expect(result.isError).toBe(true);
	});

	it("content type is always text", () => {
		const result = error("nope");
		expect(result.content[0].type).toBe("text");
	});
});
