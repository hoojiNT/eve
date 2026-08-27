import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRegistry } from "./registry.ts";
import { resolveIsolatedWidget } from "./resolve.ts";
import { parseCountdownConfig, defaultCountdownConfig } from "./countdown/schema.ts";
import { parseClockConfig, defaultClockConfig } from "./clock/schema.ts";
import { parseNoteConfig, defaultNoteConfig } from "./note/schema.ts";
import { parseProgressConfig } from "./progress/schema.ts";
import type { AnyWidgetPlugin } from "./types.ts";

function stubPlugin(type: string, parseConfig?: (raw: unknown) => unknown): AnyWidgetPlugin {
  return {
    type,
    version: 1,
    display: {
      title: () => type,
      description: () => type,
      icon: (() => null) as unknown as AnyWidgetPlugin["display"]["icon"],
    },
    layout: { w: 2, h: 2, minW: 1, minH: 1 },
    defaultConfig: () => ({ ok: true }),
    parseConfig: parseConfig ?? ((raw) => raw ?? { ok: true }),
    Widget: () => null,
  };
}

describe("plugin registry", () => {
  it("registers, lists in order, and replaces duplicates", () => {
    const { registerWidget, getWidget, listWidgets } = createRegistry();
    registerWidget(stubPlugin("a"));
    registerWidget(stubPlugin("b"));
    assert.deepEqual(
      listWidgets().map((p) => p.type),
      ["a", "b"],
    );
    registerWidget({ ...stubPlugin("a"), version: 2 });
    assert.equal(getWidget("a")?.version, 2);
    assert.deepEqual(
      listWidgets().map((p) => p.type),
      ["a", "b"],
    );
    assert.equal(getWidget("missing"), undefined);
  });
});

describe("resolveIsolatedWidget", () => {
  it("returns unknown for a missing type", () => {
    const lookup = () => undefined;
    assert.deepEqual(resolveIsolatedWidget("ghost", {}, lookup), { status: "unknown" });
  });

  it("parses config through the plugin and falls back if parse throws", () => {
    const plugin = stubPlugin("boom", () => {
      throw new Error("bad");
    });
    const lookup = (type: string) => (type === "boom" ? plugin : undefined);
    const resolved = resolveIsolatedWidget("boom", { garbage: true }, lookup);
    assert.equal(resolved.status, "ready");
    if (resolved.status === "ready") {
      assert.deepEqual(resolved.config, { ok: true });
    }
  });
});

describe("parseConfig never throws", () => {
  it("countdown garbage returns defaults", () => {
    assert.deepEqual(parseCountdownConfig({ garbage: true }), defaultCountdownConfig());
    assert.deepEqual(parseCountdownConfig(null), defaultCountdownConfig());
    assert.equal(parseCountdownConfig({ mode: "lunar", timeZone: "UTC" }).mode, "lunar");
  });

  it("clock, progress, note salvage partial data", () => {
    assert.deepEqual(parseClockConfig("nope"), defaultClockConfig());
    assert.equal(parseClockConfig({ hour12: true, timeZone: "UTC", showSeconds: false }).hour12, true);
    assert.equal(parseProgressConfig({ timeZone: "UTC" }).timeZone, "UTC");
    assert.equal(parseProgressConfig(undefined).timeZone, "default");
    assert.deepEqual(parseNoteConfig({ text: "hello" }), { title: "", text: "hello" });
    assert.deepEqual(parseNoteConfig(123), defaultNoteConfig());
  });
});
