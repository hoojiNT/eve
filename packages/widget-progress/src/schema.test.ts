import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseProgressConfig } from "./schema.ts";

describe("parseProgressConfig never throws", () => {
  it("salvages partial data, falls back to defaults on garbage", () => {
    assert.equal(parseProgressConfig({ timeZone: "UTC" }).timeZone, "UTC");
    assert.equal(parseProgressConfig(undefined).timeZone, "default");
  });
});
