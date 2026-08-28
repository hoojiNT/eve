import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseNoteConfig, defaultNoteConfig } from "./schema.ts";

describe("parseNoteConfig never throws", () => {
  it("salvages partial data, falls back to defaults on garbage", () => {
    assert.deepEqual(parseNoteConfig({ text: "hello" }), { title: "", text: "hello" });
    assert.deepEqual(parseNoteConfig(123), defaultNoteConfig());
  });
});
