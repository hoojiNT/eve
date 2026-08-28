import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseLunarConfig, defaultLunarConfig } from "./schema.ts";

describe("parseLunarConfig never throws", () => {
  it("salvages partial data, falls back to defaults on garbage", () => {
    assert.deepEqual(parseLunarConfig("nope"), defaultLunarConfig());
    assert.equal(parseLunarConfig({ timeZone: "UTC" }).timeZone, "UTC");
  });
});
