import { Clock } from "lucide-react";
import type { WidgetPlugin } from "@eve/widget-sdk";
import { clockCopy } from "./copy";
import { defaultClockConfig, parseClockConfig, type ClockConfig } from "./schema";
import { ClockSettings } from "./settings";
import { ClockWidget } from "./widget";

export const clockPlugin: WidgetPlugin<ClockConfig> = {
  type: "clock",
  version: 1,
  display: {
    title: (locale) => clockCopy[locale].title,
    description: (locale) => clockCopy[locale].description,
    icon: Clock,
  },
  layout: { w: 4, h: 4, minW: 2, minH: 3 },
  defaultConfig: defaultClockConfig,
  parseConfig: parseClockConfig,
  Widget: ClockWidget,
  Settings: ClockSettings,
};

export type { ClockConfig } from "./schema";
export { defaultClockConfig, parseClockConfig } from "./schema";
