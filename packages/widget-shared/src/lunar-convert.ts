import { AstroTime, SearchMoonPhase, SunPosition } from "astronomy-engine";
import { getDateTimeInTimeZone } from "./lunar-calendar.ts";

/**
 * Solar (Gregorian) to Vietnamese lunar date conversion. Follows the classic
 * month/leap-month bookkeeping popularized by Hồ Ngọc Đức, but sources new
 * moon times and solar longitude from `astronomy-engine` (VSOP87/ELP2000
 * based) instead of the original truncated trigonometric series — the
 * truncated series has ~2 hour error, enough to misattribute a new moon to
 * the wrong calendar day whenever it falls close to local midnight.
 */

const J2000_JD = 2451545.0;
const SYNODIC_MONTH = 29.530588853;
/** Reference epoch for indexing lunation numbers (k); only used to seed the astronomical search window. */
const NEW_MOON_EPOCH_JD = 2415021.076998695;

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  if (jd < 2299161) {
    jd =
      dd +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      32083;
  }
  return jd;
}

/** Gregorian JDN at noon UTC. Used by Can Chi day. */
export function julianDayNumber(year: number, month: number, day: number): number {
  return jdFromDate(day, month, year);
}

/** Precise UTC Julian Date of the new moon nearest lunation `k`. */
function newMoonJd(k: number): number {
  const approxJd = NEW_MOON_EPOCH_JD + k * SYNODIC_MONTH;
  const searchStart = new AstroTime(approxJd - 3 - J2000_JD);
  const found = SearchMoonPhase(0, searchStart, 6);
  if (!found) {
    throw new Error(`No new moon found near lunation ${k}`);
  }
  return found.ut + J2000_JD;
}

/** Index (0-11) of the 30°-wide solar term the sun occupies at local midnight of `dayNumber` (a JDN) in `timeZone`. */
function getSunLongitude(dayNumber: number, timeZone: number): number {
  const jd = dayNumber - 0.5 - timeZone / 24;
  const elon = SunPosition(new AstroTime(jd - J2000_JD)).elon;
  return Math.floor(elon / 30);
}

function getNewMoonDay(k: number, timeZone: number): number {
  return Math.floor(newMoonJd(k) + 0.5 + timeZone / 24);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / SYNODIC_MONTH);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - NEW_MOON_EPOCH_JD) / SYNODIC_MONTH + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i += 1;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export type LunarDate = {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
};

/** Converts a Gregorian date to its Vietnamese lunar equivalent. `utcOffset` is hours, e.g. 7 for Vietnam. */
export function solarToLunar(year: number, month: number, day: number, utcOffset: number): LunarDate {
  const dayNumber = jdFromDate(day, month, year);
  const k = Math.floor((dayNumber - NEW_MOON_EPOCH_JD) / SYNODIC_MONTH);
  let monthStart = getNewMoonDay(k + 1, utcOffset);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, utcOffset);
  }
  let a11 = getLunarMonth11(year, utcOffset);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = year;
    a11 = getLunarMonth11(year - 1, utcOffset);
  } else {
    lunarYear = year + 1;
    b11 = getLunarMonth11(year + 1, utcOffset);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarMonth = diff + 11;
  let isLeapMonth = false;
  if (b11 - a11 > 365) {
    const leapMonthOffset = getLeapMonthOffset(a11, utcOffset);
    if (diff >= leapMonthOffset) {
      lunarMonth = diff + 10;
      if (diff === leapMonthOffset) {
        isLeapMonth = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeapMonth };
}

/** Resolves the current lunar date for a given IANA timezone. */
export function getLunarDateInTimeZone(now: Date, timeZone: string): LunarDate {
  const parts = getDateTimeInTimeZone(now, timeZone);
  const offsetMs =
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - now.getTime();
  const utcOffset = offsetMs / 3600000;
  return solarToLunar(parts.year, parts.month, parts.day, utcOffset);
}
