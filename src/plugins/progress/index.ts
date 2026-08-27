import { Orbit } from "lucide-react";
import type { WidgetPlugin } from "../types";
import { defaultProgressConfig, parseProgressConfig, type ProgressConfig } from "./schema";
import { ProgressSettings } from "./settings";
import { ProgressWidget } from "./widget";

export const progressPlugin: WidgetPlugin<ProgressConfig> = {
  type: "progress",
  version: 1,
  display: {
    title: (c) => c.progress,
    description: (c) => c.progressDesc,
    icon: Orbit,
  },
  layout: { w: 4, h: 3, minW: 2, minH: 2 },
  defaultConfig: defaultProgressConfig,
  parseConfig: parseProgressConfig,
  Widget: ProgressWidget,
  Settings: ProgressSettings,
};
