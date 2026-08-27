/** First day of Tết Nguyên Đán (lunar new year), local calendar date. */
export const TET_DATES: Record<number, string> = {
  2024: "2024-02-10",
  2025: "2025-01-29",
  2026: "2026-02-17",
  2027: "2027-02-06",
  2028: "2028-01-26",
  2029: "2029-02-13",
  2030: "2030-02-03",
  2031: "2031-01-23",
  2032: "2032-02-11",
  2033: "2033-01-31",
  2034: "2034-02-19",
  2035: "2035-02-08",
  2036: "2036-01-28",
  2037: "2037-02-15",
  2038: "2038-02-04",
  2039: "2039-01-24",
  2040: "2040-02-12",
};

export type CountdownMode = "gregorian" | "lunar";

export type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function getDateTimeInTimeZone(date: Date, timeZone: string): DateTimeParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function zonedLocalToUtcMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): number {
  let utc = Date.UTC(year, month - 1, day, hour, minute, second);
  for (let i = 0; i < 4; i += 1) {
    const parts = getDateTimeInTimeZone(new Date(utc), timeZone);
    const got = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const want = Date.UTC(year, month - 1, day, hour, minute, second);
    utc += want - got;
    if (want === got) break;
  }
  return utc;
}

function parseIsoDate(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split("-").map(Number);
  return { year: year ?? 0, month: month ?? 1, day: day ?? 1 };
}

export function nextGregorianNewYear(now: Date, timeZone: string): { at: number; year: number } {
  const parts = getDateTimeInTimeZone(now, timeZone);
  let year = parts.year + 1;
  if (parts.month === 1 && parts.day === 1 && parts.hour === 0 && parts.minute === 0 && parts.second === 0) {
    year = parts.year;
  }
  const at = zonedLocalToUtcMs(year, 1, 1, 0, 0, 0, timeZone);
  if (at <= now.getTime()) {
    year += 1;
    return { at: zonedLocalToUtcMs(year, 1, 1, 0, 0, 0, timeZone), year };
  }
  return { at, year };
}

export function nextLunarNewYear(now: Date, timeZone: string): { at: number; year: number } {
  const years = Object.keys(TET_DATES)
    .map(Number)
    .sort((a, b) => a - b);
  for (const year of years) {
    const iso = TET_DATES[year];
    if (!iso) continue;
    const { month, day } = parseIsoDate(iso);
    const at = zonedLocalToUtcMs(year, month, day, 0, 0, 0, timeZone);
    if (at > now.getTime()) {
      return { at, year };
    }
  }
  const fallbackYear = getDateTimeInTimeZone(now, timeZone).year + 1;
  return { at: zonedLocalToUtcMs(fallbackYear, 2, 1, 0, 0, 0, timeZone), year: fallbackYear };
}

export type Remaining = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  targetYear: number;
  targetAt: number;
  isZero: boolean;
};

export function remainingUntil(
  now: Date,
  timeZone: string,
  mode: CountdownMode,
): Remaining {
  const next = mode === "lunar" ? nextLunarNewYear(now, timeZone) : nextGregorianNewYear(now, timeZone);
  const totalMs = Math.max(0, next.at - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    targetYear: next.year,
    targetAt: next.at,
    isZero: totalMs <= 0,
  };
}

export function yearProgress(now: Date, timeZone: string): {
  year: number;
  elapsed: number;
  total: number;
  ratio: number;
} {
  const parts = getDateTimeInTimeZone(now, timeZone);
  const start = zonedLocalToUtcMs(parts.year, 1, 1, 0, 0, 0, timeZone);
  const end = zonedLocalToUtcMs(parts.year + 1, 1, 1, 0, 0, 0, timeZone);
  const total = end - start;
  const elapsed = Math.min(total, Math.max(0, now.getTime() - start));
  return { year: parts.year, elapsed, total, ratio: total === 0 ? 0 : elapsed / total };
}

export function isNewYearDay(now: Date, timeZone: string, mode: CountdownMode): boolean {
  const parts = getDateTimeInTimeZone(now, timeZone);
  if (mode === "gregorian") {
    return parts.month === 1 && parts.day === 1;
  }
  const iso = TET_DATES[parts.year];
  if (!iso) return false;
  const { month, day } = parseIsoDate(iso);
  return parts.month === month && parts.day === day;
}

export const TIMEZONES = [
  { id: "local", labelVi: "Máy của bạn", labelEn: "Your device" },
  { id: "Asia/Ho_Chi_Minh", labelVi: "Việt Nam", labelEn: "Vietnam" },
  { id: "Asia/Bangkok", labelVi: "Bangkok", labelEn: "Bangkok" },
  { id: "Asia/Singapore", labelVi: "Singapore", labelEn: "Singapore" },
  { id: "Asia/Tokyo", labelVi: "Tokyo", labelEn: "Tokyo" },
  { id: "Asia/Seoul", labelVi: "Seoul", labelEn: "Seoul" },
  { id: "Asia/Shanghai", labelVi: "Thượng Hải", labelEn: "Shanghai" },
  { id: "Australia/Sydney", labelVi: "Sydney", labelEn: "Sydney" },
  { id: "Europe/London", labelVi: "London", labelEn: "London" },
  { id: "Europe/Paris", labelVi: "Paris", labelEn: "Paris" },
  { id: "America/New_York", labelVi: "New York", labelEn: "New York" },
  { id: "America/Los_Angeles", labelVi: "Los Angeles", labelEn: "Los Angeles" },
  { id: "UTC", labelVi: "UTC", labelEn: "UTC" },
] as const;

export function resolveTimeZone(id: string): string {
  if (id === "local") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }
  return id;
}
