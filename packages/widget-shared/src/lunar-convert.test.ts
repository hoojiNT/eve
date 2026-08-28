import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { solarToLunar } from "./lunar-convert.ts";
import { TET_DATES } from "./lunar-calendar.ts";

describe("solarToLunar", () => {
  it("maps every known Tết date to lunar 1/1", () => {
    for (const [year, iso] of Object.entries(TET_DATES)) {
      const [y, m, d] = iso.split("-").map(Number);
      const lunar = solarToLunar(y as number, m as number, d as number, 7);
      assert.equal(lunar.day, 1, `year ${year}`);
      assert.equal(lunar.month, 1, `year ${year}`);
      assert.equal(lunar.isLeapMonth, false, `year ${year}`);
    }
  });

  it("day after Tết rolls over to lunar 1/2", () => {
    const lunar = solarToLunar(2026, 2, 18, 7);
    assert.equal(lunar.day, 2);
    assert.equal(lunar.month, 1);
    assert.equal(lunar.year, 2026);
  });

  it("matches a published reference date (2026-08-28 -> 16/7 âm, Bính Ngọ)", () => {
    const lunar = solarToLunar(2026, 8, 28, 7);
    assert.equal(lunar.day, 16);
    assert.equal(lunar.month, 7);
    assert.equal(lunar.year, 2026);
    assert.equal(lunar.isLeapMonth, false);
  });
});
