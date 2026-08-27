import { Clock } from "lucide-react";
import type { WidgetPlugin } from "../types";
import { defaultClockConfig, parseClockConfig, type ClockConfig } from "./schema";
import { ClockSettings } from "./settings";
import { ClockWidget } from "./widget";

export const clockPlugin: WidgetPlugin<ClockConfig> = {
  type: "clock",
  version: 1,
  display: {
    title: (c) => c.clock,
    description: (c) => c.clockDesc,
    icon: Clock,
  },
  layout: { w: 4, h: 4, minW: 2, minH: 3 },
  defaultConfig: defaultClockConfig,
  parseConfig: parseClockConfig,
  Widget: ClockWidget,
  Settings: ClockSettings,
};
