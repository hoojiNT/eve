import { AstroTime, Body, Illumination, MoonPhase, SearchMoonPhase, SunPosition } from "astronomy-engine";
import { getLunarDateInTimeZone, julianDayNumber, type LunarDate } from "./lunar-convert.ts";
import { getDateTimeInTimeZone } from "./lunar-calendar.ts";

/** Same value as DEFAULT_TIME_ZONE. The lunar calendar is Vietnam's national calendar. */
const LUNAR_CALENDAR_TZ = "Asia/Ho_Chi_Minh";

export const HEAVENLY_STEMS = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
] as const;

export const EARTHLY_BRANCHES = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
] as const;

/** Index 0 = Xuân phân at solar longitude 0°. */
export const SOLAR_TERM_NAMES = {
  vi: [
    "Xuân phân",
    "Thanh minh",
    "Cốc vũ",
    "Lập hạ",
    "Tiểu mãn",
    "Mang chủng",
    "Hạ chí",
    "Tiểu thử",
    "Đại thử",
    "Lập thu",
    "Xử thử",
    "Bạch lộ",
    "Thu phân",
    "Hàn lộ",
    "Sương giáng",
    "Lập đông",
    "Tiểu tuyết",
    "Đại tuyết",
    "Đông chí",
    "Tiểu hàn",
    "Đại hàn",
    "Lập xuân",
    "Vũ thủy",
    "Kinh trập",
  ],
  en: [
    "Vernal equinox",
    "Clear and bright",
    "Grain rain",
    "Start of summer",
    "Grain full",
    "Grain in ear",
    "Summer solstice",
    "Minor heat",
    "Major heat",
    "Start of autumn",
    "Limit of heat",
    "White dew",
    "Autumnal equinox",
    "Cold dew",
    "Frost",
    "Start of winter",
    "Minor snow",
    "Major snow",
    "Winter solstice",
    "Minor cold",
    "Major cold",
    "Start of spring",
    "Rain water",
    "Awakening insects",
  ],
} as const;

export type CanChi = {
  stem: number;
  branch: number;
  label: string;
};

export type MoonPhaseName =
  | "new"
  | "waxingCrescent"
  | "firstQuarter"
  | "waxingGibbous"
  | "full"
  | "waningGibbous"
  | "lastQuarter"
  | "waningCrescent";

export type LunarDetails = {
  lunar: LunarDate;
  year: CanChi;
  month: CanChi;
  day: CanChi;
  moon: {
    phaseDeg: number;
    illumination: number;
    name: MoonPhaseName;
  };
  termIndex: number;
  next: { kind: "new" | "full"; at: Date; days: number } | null;
};

function makeCanChi(stem: number, branch: number): CanChi {
  return {
    stem,
    branch,
    label: `${HEAVENLY_STEMS[stem]} ${EARTHLY_BRANCHES[branch]}`,
  };
}

export function canChiOfYear(lunarYear: number): CanChi {
  const stem = ((lunarYear - 4) % 10 + 10) % 10;
  const branch = ((lunarYear - 4) % 12 + 12) % 12;
  return makeCanChi(stem, branch);
}

/** Leap months share the Can Chi of the same-number regular month. */
export function canChiOfMonth(lunarYear: number, lunarMonth: number): CanChi {
  const yearStem = ((lunarYear - 4) % 10 + 10) % 10;
  const month1Stem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yearStem] ?? 0;
  const stem = (month1Stem + lunarMonth - 1) % 10;
  const branch = (2 + lunarMonth - 1) % 12;
  return makeCanChi(stem, branch);
}

export function canChiOfSolarDay(year: number, month: number, day: number): CanChi {
  const jdn = julianDayNumber(year, month, day);
  const stem = (((jdn + 9) % 10) + 10) % 10;
  const branch = (((jdn + 1) % 12) + 12) % 12;
  return makeCanChi(stem, branch);
}

export function moonPhaseName(phaseDeg: number): MoonPhaseName {
  const d = ((phaseDeg % 360) + 360) % 360;
  if (d < 22.5 || d >= 337.5) return "new";
  if (d < 67.5) return "waxingCrescent";
  if (d < 112.5) return "firstQuarter";
  if (d < 157.5) return "waxingGibbous";
  if (d < 202.5) return "full";
  if (d < 247.5) return "waningGibbous";
  if (d < 292.5) return "lastQuarter";
  return "waningCrescent";
}

function solarTermIndex(now: Date): number {
  const elon = SunPosition(new AstroTime(now)).elon;
  const deg = ((elon % 360) + 360) % 360;
  return Math.min(23, Math.floor(deg / 15));
}

function nextSocOrRam(now: Date): LunarDetails["next"] {
  try {
    const start = new AstroTime(now);
    const nextNew = SearchMoonPhase(0, start, 40);
    const nextFull = SearchMoonPhase(180, start, 40);
    const candidates: { kind: "new" | "full"; at: Date }[] = [];
    if (nextNew) candidates.push({ kind: "new", at: nextNew.date });
    if (nextFull) candidates.push({ kind: "full", at: nextFull.date });
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.at.getTime() - b.at.getTime());
    const nearest = candidates[0];
    if (!nearest) return null;
    const days = Math.max(0, Math.ceil((nearest.at.getTime() - now.getTime()) / 86_400_000));
    return { kind: nearest.kind, at: nearest.at, days };
  } catch {
    return null;
  }
}

export function getLunarDetails(now: Date): LunarDetails {
  const lunar = getLunarDateInTimeZone(now, LUNAR_CALENDAR_TZ);
  const parts = getDateTimeInTimeZone(now, LUNAR_CALENDAR_TZ);
  const phaseDeg = MoonPhase(now);
  const illumination = Illumination(Body.Moon, now).phase_fraction;
  return {
    lunar,
    year: canChiOfYear(lunar.year),
    month: canChiOfMonth(lunar.year, lunar.month),
    day: canChiOfSolarDay(parts.year, parts.month, parts.day),
    moon: {
      phaseDeg,
      illumination,
      name: moonPhaseName(phaseDeg),
    },
    termIndex: solarTermIndex(now),
    next: nextSocOrRam(now),
  };
}
