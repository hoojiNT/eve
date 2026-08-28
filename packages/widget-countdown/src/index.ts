import { Timer } from "lucide-react";
import type { WidgetPlugin } from "@eve/widget-sdk";
import { countdownCopy } from "./copy";
import { defaultCountdownConfig, parseCountdownConfig, type CountdownConfig } from "./schema";
import { CountdownSettings } from "./settings";
import { CountdownWidget } from "./widget";

export const countdownPlugin: WidgetPlugin<CountdownConfig> = {
  type: "countdown",
  version: 1,
  display: {
    title: (locale) => countdownCopy[locale].title,
    description: (locale) => countdownCopy[locale].description,
    icon: Timer,
  },
  layout: { w: 8, h: 4, minW: 4, minH: 3 },
  defaultConfig: defaultCountdownConfig,
  parseConfig: parseCountdownConfig,
  Widget: CountdownWidget,
  Settings: CountdownSettings,
};

export type { CountdownConfig } from "./schema";
export { defaultCountdownConfig, parseCountdownConfig } from "./schema";
