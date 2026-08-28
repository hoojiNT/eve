import { Orbit } from "lucide-react";
import type { WidgetPlugin } from "@eve/widget-sdk";
import { progressCopy } from "./copy";
import { defaultProgressConfig, parseProgressConfig, type ProgressConfig } from "./schema";
import { ProgressSettings } from "./settings";
import { ProgressWidget } from "./widget";

export const progressPlugin: WidgetPlugin<ProgressConfig> = {
  type: "progress",
  version: 1,
  display: {
    title: (locale) => progressCopy[locale].title,
    description: (locale) => progressCopy[locale].description,
    icon: Orbit,
  },
  layout: { w: 4, h: 3, minW: 2, minH: 2 },
  defaultConfig: defaultProgressConfig,
  parseConfig: parseProgressConfig,
  Widget: ProgressWidget,
  Settings: ProgressSettings,
};

export type { ProgressConfig } from "./schema";
export { defaultProgressConfig, parseProgressConfig } from "./schema";
