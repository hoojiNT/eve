import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { defaultPianoConfig, parsePianoConfig } from "./schema.ts";

describe("parsePianoConfig never throws", () => {
  it("keeps a valid volume and fills the default when the field is missing", () => {
    assert.deepEqual(parsePianoConfig({ volume: 0.4 }), { volume: 0.4 });
    assert.deepEqual(parsePianoConfig({}), defaultPianoConfig());
  });

  it("falls back to the default on garbage or an out-of-range volume", () => {
    assert.deepEqual(parsePianoConfig(123), defaultPianoConfig());
    assert.deepEqual(parsePianoConfig({ volume: 2 }), defaultPianoConfig());
    assert.deepEqual(parsePianoConfig({ volume: -0.1 }), defaultPianoConfig());
    assert.deepEqual(parsePianoConfig(null), defaultPianoConfig());
  });
});
