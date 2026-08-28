import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { solarToLunar } from "./lunar-convert.ts";
import {
  canChiOfMonth,
  canChiOfSolarDay,
  canChiOfYear,
  getLunarDetails,
  moonPhaseName,
  SOLAR_TERM_NAMES,
} from "./lunar-details.ts";

describe("Can Chi", () => {
  it("names 2026 as Bính Ngọ", () => {
    assert.equal(canChiOfYear(2026).label, "Bính Ngọ");
  });

  it("names Tết 2026 month Canh Dần", () => {
    assert.equal(canChiOfMonth(2026, 1).label, "Canh Dần");
  });

  it("matches published calendar for 2026-08-28", () => {
    // licham.prices.vn / xemlicham.com: ngày Giáp Tuất, tháng Bính Thân, năm Bính Ngọ
    assert.equal(canChiOfYear(2026).label, "Bính Ngọ");
    assert.equal(canChiOfMonth(2026, 7).label, "Bính Thân");
    assert.equal(canChiOfSolarDay(2026, 8, 28).label, "Giáp Tuất");
  });

  it("gives leap months the same Can Chi as the regular month of that number", () => {
    const regularByKey = new Map<string, { year: number; month: number }>();
    for (let month = 1; month <= 12; month += 1) {
      for (let day = 1; day <= 28; day += 1) {
        const lunar = solarToLunar(2025, month, day, 7);
        const key = `${lunar.year}-${lunar.month}`;
        if (!lunar.isLeapMonth && !regularByKey.has(key)) {
          regularByKey.set(key, { year: lunar.year, month: lunar.month });
        }
        if (lunar.isLeapMonth) {
          const regular = regularByKey.get(key);
          assert.ok(regular, `regular month ${key} should precede leap month`);
          assert.equal(canChiOfMonth(lunar.year, lunar.month).label, canChiOfMonth(regular.year, regular.month).label);
          return;
        }
      }
    }
    assert.fail("2025 should contain a leap lunar month");
  });
});

describe("getLunarDetails", () => {
  it("maps Tết 2026-02-17 to lunar 1/1 Bính Ngọ near a new moon", () => {
    const details = getLunarDetails(new Date("2026-02-17T12:00:00+07:00"));
    assert.equal(details.lunar.day, 1);
    assert.equal(details.lunar.month, 1);
    assert.equal(details.lunar.year, 2026);
    assert.equal(details.year.label, "Bính Ngọ");
    assert.equal(details.month.label, "Canh Dần");
    assert.ok(details.moon.illumination < 0.2);
    const d = ((details.moon.phaseDeg % 360) + 360) % 360;
    assert.ok(d < 40 || d > 320, `phaseDeg ${details.moon.phaseDeg}`);
  });

  it("maps 2026-08-28 to 16/7, Giáp Tuất / Bính Thân, tiết Xử thử", () => {
    const details = getLunarDetails(new Date("2026-08-28T12:00:00+07:00"));
    assert.equal(details.lunar.day, 16);
    assert.equal(details.lunar.month, 7);
    assert.equal(details.lunar.isLeapMonth, false);
    assert.equal(details.year.label, "Bính Ngọ");
    assert.equal(details.month.label, "Bính Thân");
    assert.equal(details.day.label, "Giáp Tuất");
    assert.equal(details.termIndex, 10);
    assert.equal(SOLAR_TERM_NAMES.vi[details.termIndex], "Xử thử");
    assert.ok(details.moon.illumination > 0.85);
    assert.ok(details.moon.name === "full" || details.moon.name === "waningGibbous");
    assert.ok(details.next);
    assert.ok(details.next.days >= 0);
  });
});

describe("moonPhaseName", () => {
  it("buckets the four quarters", () => {
    assert.equal(moonPhaseName(0), "new");
    assert.equal(moonPhaseName(90), "firstQuarter");
    assert.equal(moonPhaseName(180), "full");
    assert.equal(moonPhaseName(270), "lastQuarter");
    assert.equal(moonPhaseName(359), "new");
  });
});
