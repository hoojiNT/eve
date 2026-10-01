import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BACKGROUND_IDS,
  backgroundOptionLabel,
  backgroundSwatch,
  isSafeImageUrl,
  normalizeHex,
  parseBackgroundColor,
  parseBackgroundId,
  parseBackgroundImage,
  resolveBackground,
} from "./background.ts";

const copy = {
  backgroundDefault: "Mặc định",
  backgroundNight: "Đêm",
  backgroundLantern: "Đèn lồng",
  backgroundPine: "Thông",
  backgroundCustom: "Tùy chỉnh",
};

describe("parseBackgroundId", () => {
  it("accepts known ids and falls back to default", () => {
    assert.equal(parseBackgroundId("lantern"), "lantern");
    assert.equal(parseBackgroundId("custom"), "custom");
    assert.equal(parseBackgroundId("nope"), "default");
    assert.equal(parseBackgroundId(null), "default");
  });
});

describe("normalizeHex", () => {
  it("accepts short and long hex, with or without a hash", () => {
    assert.equal(normalizeHex("#abc"), "#aabbcc");
    assert.equal(normalizeHex("AABBCC"), "#aabbcc");
    assert.equal(normalizeHex("#0a0a0c"), "#0a0a0c");
  });

  it("rejects CSS injection and partial values", () => {
    assert.equal(normalizeHex("#fff;background:url(evil)"), null);
    assert.equal(normalizeHex("red"), null);
    assert.equal(normalizeHex("#12"), null);
    assert.equal(normalizeHex(""), null);
  });
});

describe("stored drafts", () => {
  it("keeps a short color draft and drops anything else", () => {
    assert.equal(parseBackgroundColor("  #aabbcc  "), "#aabbcc");
    assert.equal(parseBackgroundColor("#1122334455"), "#112233");
    assert.equal(parseBackgroundColor(1), "");
  });

  it("trims and caps image drafts", () => {
    assert.equal(
      parseBackgroundImage("  https://cdn.example/a.png  "),
      "https://cdn.example/a.png",
    );
    assert.equal(parseBackgroundImage("a".repeat(2100)).length, 2000);
    assert.equal(parseBackgroundImage(null), "");
  });
});

describe("isSafeImageUrl", () => {
  it("allows https URLs and rejects breakouts", () => {
    assert.equal(isSafeImageUrl("https://cdn.example/a.png"), true);
    assert.equal(isSafeImageUrl("https://cdn.example/a.png?w=1200&fmt=jpg"), true);
    assert.equal(isSafeImageUrl("http://cdn.example/a.png"), false);
    assert.equal(isSafeImageUrl("https://user:pass@cdn.example/a.png"), false);
    assert.equal(isSafeImageUrl('https://cdn.example/a.png");color:red'), false);
    assert.equal(isSafeImageUrl("https://cdn.example/a.png)"), false);
    assert.equal(isSafeImageUrl("javascript:alert(1)"), false);
    assert.equal(isSafeImageUrl("data:image/svg+xml,evil"), false);
    assert.equal(isSafeImageUrl(""), false);
  });
});

describe("resolveBackground", () => {
  it("leaves the designed background untouched", () => {
    const resolved = resolveBackground("default");
    assert.equal(resolved.color, null);
    assert.equal(resolved.image, null);
    assert.deepEqual(resolveBackground("nope"), resolved);
  });

  it("uses a preset gradient", () => {
    const night = resolveBackground("night");
    assert.equal(night.color, "#0a0a0c");
    assert.match(night.image ?? "", /^radial-gradient\(/);
  });

  it("applies a custom color and ignores an unsafe one", () => {
    const custom = resolveBackground("custom", "#fc0");
    assert.equal(custom.color, "#ffcc00");
    assert.equal(custom.image, null);

    const unsafe = resolveBackground("custom", "red;background:url(x)");
    assert.equal(unsafe.color, "#0a0a0c");
    assert.equal(unsafe.image, null);
  });

  it("paints a safe photo over a dark veil and drops a breakout", () => {
    const photo = resolveBackground("pine", "", "https://cdn.example/board.jpg");
    assert.match(photo.image ?? "", /linear-gradient/);
    assert.match(photo.image ?? "", /url\("https:\/\/cdn\.example\/board\.jpg"\)/);

    const broken = resolveBackground("custom", "#112233", 'https://cdn.example/a.png")');
    assert.equal(broken.color, "#112233");
    assert.equal(broken.image, null);
  });

  it("can lay a photo on the default color", () => {
    const resolved = resolveBackground("default", "", "https://cdn.example/a.png");
    assert.equal(resolved.color, "#0a0a0c");
    assert.match(resolved.image ?? "", /url\("https:\/\/cdn\.example\/a\.png"\)/);
  });
});

describe("labels and swatches", () => {
  it("names each option from copy and shows the chosen color", () => {
    assert.equal(backgroundOptionLabel("lantern", copy), "Đèn lồng");
    assert.equal(backgroundOptionLabel("custom", copy), "Tùy chỉnh");
    assert.equal(backgroundSwatch("custom", "#abc"), "#aabbcc");
    assert.equal(backgroundSwatch("custom", "nope"), "#0a0a0c");
    assert.equal(backgroundSwatch("night", ""), "#1a2236");
    assert.equal(BACKGROUND_IDS.includes("custom"), true);
  });
});
