import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseCountdownConfig, defaultCountdownConfig } from "./schema.ts";

describe("parseCountdownConfig never throws", () => {
  it("garbage returns defaults", () => {
    assert.deepEqual(parseCountdownConfig({ garbage: true }), defaultCountdownConfig());
    assert.deepEqual(parseCountdownConfig(null), defaultCountdownConfig());
    assert.equal(parseCountdownConfig({ mode: "lunar", timeZone: "UTC" }).mode, "lunar");
  });
});
