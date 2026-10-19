import type { Locale } from "@eve/widget-sdk";

export const pianoCopy = {
  vi: {
    title: "Đàn piano",
    description: "Bấm phím để nghe nốt và xem nốt nhạc bay lên.",
    volume: "Âm lượng",
  },
  en: {
    title: "Piano",
    description: "Tap a key to hear the note and watch it rise.",
    volume: "Volume",
  },
} as const satisfies Record<Locale, Record<string, string>>;
