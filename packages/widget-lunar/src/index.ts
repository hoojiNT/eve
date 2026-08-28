import { Moon } from "lucide-react";
import type { WidgetPlugin } from "@eve/widget-sdk";
import { lunarCopy } from "./copy";
import { defaultLunarConfig, parseLunarConfig, type LunarConfig } from "./schema";
import { LunarSettings } from "./settings";
import { LunarWidget } from "./widget";

export const lunarPlugin: WidgetPlugin<LunarConfig> = {
  type: "lunar",
  version: 1,
  display: {
    title: (locale) => lunarCopy[locale].title,
    description: (locale) => lunarCopy[locale].description,
    icon: Moon,
  },
  layout: { w: 4, h: 3, minW: 2, minH: 2 },
  defaultConfig: defaultLunarConfig,
  parseConfig: parseLunarConfig,
  Widget: LunarWidget,
  Settings: LunarSettings,
};

export type { LunarConfig } from "./schema";
export { defaultLunarConfig, parseLunarConfig } from "./schema";
