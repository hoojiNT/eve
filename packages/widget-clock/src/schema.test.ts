import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseClockConfig, defaultClockConfig } from "./schema.ts";

describe("parseClockConfig never throws", () => {
  it("salvages partial data, falls back to defaults on garbage", () => {
    assert.deepEqual(parseClockConfig("nope"), defaultClockConfig());
    assert.equal(parseClockConfig({ hour12: true, timeZone: "UTC", showSeconds: false }).hour12, true);
  });
});
