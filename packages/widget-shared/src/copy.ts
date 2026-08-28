import type { Locale } from "@eve/widget-sdk";

export const widgetSharedCopy = {
  vi: { timeZone: "Múi giờ", tzDefault: "Theo bảng" },
  en: { timeZone: "Timezone", tzDefault: "Board default" },
} as const satisfies Record<Locale, Record<string, string>>;
