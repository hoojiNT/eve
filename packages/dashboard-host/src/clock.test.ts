import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { delayUntilNextBucket, truncateToBucket } from "./clock.ts";

describe("wall-clock buckets", () => {
  it("truncates to the second and the minute", () => {
    assert.equal(truncateToBucket(10_000, 1_000), 10_000);
    assert.equal(truncateToBucket(10_250, 1_000), 10_000);
    assert.equal(truncateToBucket(60_000 + 250, 60_000), 60_000);
    assert.equal(truncateToBucket(2 * 60_000 - 1, 60_000), 60_000);
  });

  it("waits until the next boundary, including an exact boundary", () => {
    assert.equal(delayUntilNextBucket(10_000, 1_000), 1_000);
    assert.equal(delayUntilNextBucket(10_250, 1_000), 750);
    assert.equal(delayUntilNextBucket(60_000 + 250, 60_000), 59_750);
    assert.equal(delayUntilNextBucket(2 * 60_000, 60_000), 60_000);
  });
});
