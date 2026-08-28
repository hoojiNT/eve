import type { Locale } from "@eve/widget-sdk";

export const noteCopy = {
  vi: {
    title: "Ghi chú",
    description: "Một mảnh giấy cho điều ước hoặc việc cần làm.",
    noteTitle: "Ghi chú",
    notePlaceholder: "Viết điều ước cho năm mới…",
  },
  en: {
    title: "Note",
    description: "A scrap of paper for a wish or a to-do.",
    noteTitle: "Note",
    notePlaceholder: "Write a wish for the new year…",
  },
} as const satisfies Record<Locale, Record<string, string>>;
