import { create } from "zustand";
import { persist } from "zustand/middleware";
import { compactVertical, firstFit, packLeft, resolveDrop, type GridItem } from "@/lib/grid";
import type { Locale } from "@/lib/i18n";

export type WidgetType = "countdown" | "clock" | "progress" | "note";

export type CountdownConfig = {
  mode: "gregorian" | "lunar";
  timeZone: string;
};

export type ClockConfig = {
  timeZone: string;
  hour12: boolean;
  showSeconds: boolean;
};

export type ProgressConfig = {
  timeZone: string;
};

export type NoteConfig = {
  title: string;
  text: string;
};

export type WidgetConfigMap = {
  countdown: CountdownConfig;
  clock: ClockConfig;
  progress: ProgressConfig;
  note: NoteConfig;
};

export type WidgetInstance = GridItem & {
  type: WidgetType;
  config: WidgetConfigMap[WidgetType];
};

export type Density = "comfortable" | "regular" | "compact";

export const DENSITY_ROW: Record<Density, number> = {
  comfortable: 104,
  regular: 88,
  compact: 72,
};

export const WIDGET_DEFAULTS: Record<
  WidgetType,
  { w: number; h: number; minW: number; minH: number }
> = {
  countdown: { w: 8, h: 4, minW: 4, minH: 3 },
  clock: { w: 4, h: 4, minW: 2, minH: 3 },
  progress: { w: 4, h: 3, minW: 2, minH: 2 },
  note: { w: 8, h: 3, minW: 3, minH: 2 },
};

const DEFAULT_TZ = "Asia/Ho_Chi_Minh";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultConfig(type: WidgetType): WidgetConfigMap[WidgetType] {
  switch (type) {
    case "countdown":
      return { mode: "gregorian", timeZone: DEFAULT_TZ };
    case "clock":
      return { timeZone: DEFAULT_TZ, hour12: false, showSeconds: true };
    case "progress":
      return { timeZone: DEFAULT_TZ };
    case "note":
      return { title: "", text: "" };
  }
}

export function createDefaultWidgets(): WidgetInstance[] {
  return [
    {
      id: "countdown-1",
      type: "countdown",
      x: 0,
      y: 0,
      w: 8,
      h: 4,
      config: defaultConfig("countdown"),
    },
    {
      id: "clock-1",
      type: "clock",
      x: 8,
      y: 0,
      w: 4,
      h: 4,
      config: defaultConfig("clock"),
    },
    {
      id: "progress-1",
      type: "progress",
      x: 8,
      y: 4,
      w: 4,
      h: 3,
      config: defaultConfig("progress"),
    },
    {
      id: "note-1",
      type: "note",
      x: 0,
      y: 4,
      w: 8,
      h: 3,
      config: {
        title: "",
        text: "Năm mới, khởi đầu mới.\nViết điều ước của bạn vào đây.",
      },
    },
  ];
}

type BoardState = {
  widgets: WidgetInstance[];
  cols: number;
  density: Density;
  locale: Locale;
  isEditing: boolean;
  setEditing: (value: boolean) => void;
  setCols: (cols: number) => void;
  setDensity: (density: Density) => void;
  setLocale: (locale: Locale) => void;
  moveWidget: (id: string, next: Pick<GridItem, "x" | "y" | "w" | "h">) => void;
  setWidgets: (widgets: WidgetInstance[]) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => WidgetInstance | undefined;
  restoreWidget: (widget: WidgetInstance) => void;
  updateConfig: <T extends WidgetType>(id: string, config: Partial<WidgetConfigMap[T]>) => void;
  reset: () => void;
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      widgets: createDefaultWidgets(),
      cols: 12,
      density: "regular",
      locale: "vi",
      isEditing: false,
      setEditing: (value) => set({ isEditing: value }),
      setCols: (cols) =>
        set({
          cols,
          widgets: packLeft(get().widgets, cols) as WidgetInstance[],
        }),
      setDensity: (density) => set({ density }),
      setLocale: (locale) => set({ locale }),
      moveWidget: (id, next) => {
        const { widgets, cols } = get();
        set({
          widgets: resolveDrop(widgets, id, next, cols) as WidgetInstance[],
        });
      },
      setWidgets: (widgets) => set({ widgets }),
      addWidget: (type) => {
        const { widgets, cols } = get();
        const size = WIDGET_DEFAULTS[type];
        const w = Math.min(size.w, cols);
        const spot = firstFit(widgets, cols, w, size.h);
        const widget: WidgetInstance = {
          id: uid(),
          type,
          x: spot.x,
          y: spot.y,
          w,
          h: size.h,
          config: defaultConfig(type),
        };
        set({
          widgets: compactVertical([...widgets, widget], cols) as WidgetInstance[],
          isEditing: true,
        });
      },
      removeWidget: (id) => {
        const widget = get().widgets.find((w) => w.id === id);
        set({ widgets: get().widgets.filter((w) => w.id !== id) });
        return widget;
      },
      restoreWidget: (widget) => {
        const { widgets, cols } = get();
        if (widgets.some((w) => w.id === widget.id)) return;
        set({ widgets: compactVertical([...widgets, widget], cols) as WidgetInstance[] });
      },
      updateConfig: (id, config) =>
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, config: { ...w.config, ...config } } : w,
          ),
        }),
      reset: () =>
        set({
          widgets: createDefaultWidgets(),
          cols: 12,
          density: "regular",
          isEditing: false,
        }),
    }),
    {
      name: "eve-board-v1",
      skipHydration: true,
      partialize: (state) => ({
        widgets: state.widgets,
        cols: state.cols,
        density: state.density,
        locale: state.locale,
      }),
    },
  ),
);
