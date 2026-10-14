import { exports } from "cloudflare:workers";
import { describe, it, expect } from "vitest";

describe("Hello World worker", () => {
	it("responds with not found and proper status for /404", async () => {
		const response = await exports.default.fetch("http://example.com/404");
		expect(response.status).toBe(404);
		expect(await response.text()).toBe("404 Not Found");
	});
});