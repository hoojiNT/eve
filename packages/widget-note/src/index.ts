import { StickyNote } from "lucide-react";
import type { WidgetPlugin } from "@eve/widget-sdk";
import { noteCopy } from "./copy";
import { defaultNoteConfig, parseNoteConfig, type NoteConfig } from "./schema";
import { NoteWidget } from "./widget";

export const notePlugin: WidgetPlugin<NoteConfig> = {
  type: "note",
  version: 1,
  display: {
    title: (locale) => noteCopy[locale].title,
    description: (locale) => noteCopy[locale].description,
    icon: StickyNote,
  },
  layout: { w: 8, h: 3, minW: 3, minH: 2 },
  defaultConfig: defaultNoteConfig,
  parseConfig: parseNoteConfig,
  Widget: NoteWidget,
};

export type { NoteConfig } from "./schema";
export { defaultNoteConfig, parseNoteConfig } from "./schema";
