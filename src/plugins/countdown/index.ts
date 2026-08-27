import { Timer } from "lucide-react";
import type { WidgetPlugin } from "../types";
import { defaultCountdownConfig, parseCountdownConfig, type CountdownConfig } from "./schema";
import { CountdownSettings } from "./settings";
import { CountdownWidget } from "./widget";

export const countdownPlugin: WidgetPlugin<CountdownConfig> = {
  type: "countdown",
  version: 1,
  display: {
    title: (c) => c.countdown,
    description: (c) => c.countdownDesc,
    icon: Timer,
  },
  layout: { w: 8, h: 4, minW: 4, minH: 3 },
  defaultConfig: defaultCountdownConfig,
  parseConfig: parseCountdownConfig,
  Widget: CountdownWidget,
  Settings: CountdownSettings,
};
