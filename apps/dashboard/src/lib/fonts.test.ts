import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_FONT_ID,
  FONT_IDS,
  fontOptionLabel,
  googleFontsHref,
  isSafeCustomFontName,
  parseFontCustom,
  parseFontId,
  resolveFont,
} from "./fonts.ts";

describe("parseFontId", () => {
  it("accepts known ids and falls back to default", () => {
    assert.equal(parseFontId("inter"), "inter");
    assert.equal(parseFontId("default"), DEFAULT_FONT_ID);
    assert.equal(parseFontId("nope"), DEFAULT_FONT_ID);
    assert.equal(parseFontId(null), DEFAULT_FONT_ID);
    assert.equal(parseFontId(1), DEFAULT_FONT_ID);
  });
});

describe("custom font names", () => {
  it("allows Google-style family names and rejects CSS injection", () => {
    assert.equal(isSafeCustomFontName("Roboto"), true);
    assert.equal(isSafeCustomFontName("Source Sans 3"), true);
    assert.equal(isSafeCustomFontName("IBM Plex Sans"), true);
    assert.equal(isSafeCustomFontName("Be Vietnam Pro"), true);
    assert.equal(isSafeCustomFontName(""), false);
    assert.equal(isSafeCustomFontName("Comic Sans MS"), true);
    assert.equal(isSafeCustomFontName('Inter"; color:red'), false);
    assert.equal(isSafeCustomFontName("Inter, serif"), false);
    assert.equal(isSafeCustomFontName("url(evil)"), false);
  });

  it("truncates stored custom names", () => {
    assert.equal(parseFontCustom("Roboto"), "Roboto");
    assert.equal(parseFontCustom(12), "");
    assert.equal(parseFontCustom("a".repeat(80)).length, 64);
  });
});

describe("resolveFont", () => {
  it("keeps the designed pair for default and unknown ids", () => {
    const fallback = resolveFont("default");
    assert.equal(fallback.id, "default");
    assert.match(fallback.sans, /Be Vietnam Pro/);
    assert.match(fallback.display, /Literata/);
    assert.deepEqual(fallback.googleFamilies, []);
    assert.deepEqual(resolveFont("garbage"), fallback);
  });

  it("applies a preset to both UI and headlines", () => {
    const inter = resolveFont("inter");
    assert.equal(inter.sans, inter.display);
    assert.match(inter.sans, /Inter/);
    assert.deepEqual(inter.googleFamilies, ["Inter"]);

    const literata = resolveFont("literata");
    assert.match(literata.display, /Literata Variable/);
    assert.deepEqual(literata.googleFamilies, []);
  });

  it("loads a custom Google family when the name is safe", () => {
    const custom = resolveFont("custom", "  Source Sans 3  ");
    assert.equal(custom.id, "custom");
    assert.match(custom.sans, /Source Sans 3/);
    assert.deepEqual(custom.googleFamilies, ["Source Sans 3"]);
  });

  it("does not apply an unsafe custom name", () => {
    const unsafe = resolveFont("custom", "foo; background: red");
    assert.match(unsafe.sans, /Be Vietnam Pro/);
    assert.deepEqual(unsafe.googleFamilies, []);
  });
});

describe("googleFontsHref", () => {
  it("builds a css2 URL and skips junk families", () => {
    assert.equal(googleFontsHref([]), null);
    assert.equal(
      googleFontsHref(["Inter", "Source Sans 3", "bad;font"]),
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Sans+3:wght@400;500;600&display=swap",
    );
  });
});

describe("fontOptionLabel", () => {
  it("uses copy for special options and the typeface name otherwise", () => {
    const copy = { fontDefault: "Mặc định", fontSystem: "Hệ thống", fontCustom: "Khác…" };
    assert.equal(fontOptionLabel("default", copy), "Mặc định");
    assert.equal(fontOptionLabel("inter", copy), "Inter");
    assert.equal(FONT_IDS.includes("custom"), true);
  });
});
