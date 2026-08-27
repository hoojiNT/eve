import { StickyNote } from "lucide-react";
import type { WidgetPlugin } from "../types";
import { defaultNoteConfig, parseNoteConfig, type NoteConfig } from "./schema";
import { NoteWidget } from "./widget";

export const notePlugin: WidgetPlugin<NoteConfig> = {
  type: "note",
  version: 1,
  display: {
    title: (c) => c.note,
    description: (c) => c.noteDesc,
    icon: StickyNote,
  },
  layout: { w: 8, h: 3, minW: 3, minH: 2 },
  defaultConfig: defaultNoteConfig,
  parseConfig: parseNoteConfig,
  Widget: NoteWidget,
};
