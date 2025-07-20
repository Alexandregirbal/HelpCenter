import { describe, expect, it } from "vitest";
import { getClient } from "..";

describe("GET /v1/hello", () => {
  const client = getClient();

  it("should return hello", async () => {
    const result = await client.provide("get /v1/hello", { name: "John" });

    expect(result).toBeDefined();
    expect(result.status).toBe("success");
    if (result.status === "error")
      throw new Error("Expected success, got error");

    expect(result.data.greetings).toBe("Hello, John. Happy coding!");
  });
});
