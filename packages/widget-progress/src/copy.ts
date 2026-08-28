import type { Locale } from "@eve/widget-sdk";

export const progressCopy = {
  vi: {
    title: "Hành trình năm",
    description: "Phần trăm năm đã đi qua.",
    dayOf: "Ngày",
  },
  en: {
    title: "Year journey",
    description: "How much of the year has passed.",
    dayOf: "Day",
  },
} as const satisfies Record<Locale, Record<string, string>>;
