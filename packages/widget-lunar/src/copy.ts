import type { Locale } from "@eve/widget-sdk";

export const lunarCopy = {
  vi: {
    title: "Âm lịch",
    description: "Ngày âm lịch hôm nay theo múi giờ bạn chọn.",
    leap: "nhuận",
    yearPrefix: "Năm",
  },
  en: {
    title: "Lunar Calendar",
    description: "Today's Vietnamese lunar date in the timezone you pick.",
    leap: "leap",
    yearPrefix: "Year",
  },
} as const satisfies Record<Locale, Record<string, string>>;
