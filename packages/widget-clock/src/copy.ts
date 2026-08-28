import type { Locale } from "@eve/widget-sdk";

export const clockCopy = {
  vi: {
    title: "Đồng hồ",
    description: "Giờ hiện tại theo múi giờ bạn chọn.",
    format: "Định dạng",
    format24: "24 giờ",
    format12: "12 giờ",
    showSeconds: "Hiện giây",
  },
  en: {
    title: "Clock",
    description: "Current time in the timezone you pick.",
    format: "Format",
    format24: "24-hour",
    format12: "12-hour",
    showSeconds: "Show seconds",
  },
} as const satisfies Record<Locale, Record<string, string>>;
