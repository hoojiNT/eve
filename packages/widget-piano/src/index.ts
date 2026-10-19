import { Piano } from "lucide-react";
import type { WidgetPlugin } from "@eve/widget-sdk";
import { pianoCopy } from "./copy";
import { defaultPianoConfig, parsePianoConfig, type PianoConfig } from "./schema";
import { PianoSettings } from "./settings";
import { PianoWidget } from "./widget";

export const pianoPlugin: WidgetPlugin<PianoConfig> = {
  type: "piano",
  version: 1,
  display: {
    title: (locale) => pianoCopy[locale].title,
    description: (locale) => pianoCopy[locale].description,
    icon: Piano,
  },
  layout: { w: 8, h: 4, minW: 4, minH: 3 },
  defaultConfig: defaultPianoConfig,
  parseConfig: parsePianoConfig,
  Widget: PianoWidget,
  Settings: PianoSettings,
};

export type { PianoConfig } from "./schema";
export { defaultPianoConfig, parsePianoConfig } from "./schema";
