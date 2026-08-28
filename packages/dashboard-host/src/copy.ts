import type { Locale } from "@eve/widget-sdk";

export const hostCopy = {
  vi: {
    widgetError: "Widget gặp lỗi",
    widgetErrorBody: "Ô này dừng, các widget khác vẫn chạy.",
    retry: "Thử lại",
    resetConfig: "Đặt lại cài đặt",
    widgetUnavailable: "Widget không khả dụng",
    widgetUnavailableBody: "Loại widget này chưa được cài. Bạn có thể xóa ô này.",
    widgetLoading: "Đang tải…",
  },
  en: {
    widgetError: "This widget failed",
    widgetErrorBody: "This tile stopped. The rest of the board is still running.",
    retry: "Try again",
    resetConfig: "Reset settings",
    widgetUnavailable: "Widget unavailable",
    widgetUnavailableBody: "This widget type is not installed. You can delete the tile.",
    widgetLoading: "Loading…",
  },
} as const satisfies Record<Locale, Record<string, string>>;
