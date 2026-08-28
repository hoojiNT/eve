import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FALLBACK_LAYOUT, getWidget, type Locale } from "@eve/widget-sdk";
import { DEFAULT_TIME_ZONE } from "@eve/widget-shared";
import { compactVertical, firstFit, packLeft, resolveDrop, type GridItem } from "@/lib/grid";
import { registerFirstPartyPlugins } from "@/plugins/catalog";

export type WidgetInstance = GridItem & {
  type: string;
  config: unknown;
};

export type Density = "comfortable" | "regular" | "compact";

export const DENSITY_ROW: Record<Density, number> = {
  comfortable: 104,
  regular: 88,
  compact: 72,
};

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

registerFirstPartyPlugins();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
      config: { mode: "gregorian", timeZone: DEFAULT_TIME_ZONE },
    },
    {
      id: "clock-1",
      type: "clock",
      x: 8,
      y: 0,
      w: 4,
      h: 4,
      config: { timeZone: DEFAULT_TIME_ZONE, hour12: false, showSeconds: true },
    },
    {
      id: "progress-1",
      type: "progress",
      x: 8,
      y: 4,
      w: 4,
      h: 3,
      config: { timeZone: DEFAULT_TIME_ZONE },
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
  defaultTimeZone: string;
  isEditing: boolean;
  setEditing: (value: boolean) => void;
  setCols: (cols: number) => void;
  setDensity: (density: Density) => void;
  setLocale: (locale: Locale) => void;
  setDefaultTimeZone: (timeZone: string) => void;
  moveWidget: (id: string, next: Pick<GridItem, "x" | "y" | "w" | "h">) => void;
  setWidgets: (widgets: WidgetInstance[]) => void;
  addWidget: (type: string) => void;
  removeWidget: (id: string) => WidgetInstance | undefined;
  restoreWidget: (widget: WidgetInstance) => void;
  updateConfig: (id: string, patch: Record<string, unknown>) => void;
  resetWidgetConfig: (id: string) => void;
  reset: () => void;
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      widgets: createDefaultWidgets(),
      cols: 12,
      density: "regular",
      locale: "vi",
      defaultTimeZone: DEFAULT_TIME_ZONE,
      isEditing: false,
      setEditing: (value) => set({ isEditing: value }),
      setCols: (cols) =>
        set({
          cols,
          widgets: packLeft(get().widgets, cols) as WidgetInstance[],
        }),
      setDensity: (density) => set({ density }),
      setLocale: (locale) => set({ locale }),
      setDefaultTimeZone: (timeZone) => set({ defaultTimeZone: timeZone }),
      moveWidget: (id, next) => {
        const { widgets, cols } = get();
        set({
          widgets: resolveDrop(widgets, id, next, cols) as WidgetInstance[],
        });
      },
      setWidgets: (widgets) => set({ widgets }),
      addWidget: (type) => {
        const plugin = getWidget(type);
        if (!plugin) return;
        const { widgets, cols } = get();
        const size = plugin.layout;
        const w = Math.min(size.w, cols);
        const spot = firstFit(widgets, cols, w, size.h);
        const widget: WidgetInstance = {
          id: uid(),
          type,
          x: spot.x,
          y: spot.y,
          w,
          h: size.h,
          config: plugin.defaultConfig(),
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
      updateConfig: (id, patch) =>
        set({
          widgets: get().widgets.map((w) => {
            if (w.id !== id) return w;
            const base = isPlainObject(w.config) ? w.config : {};
            return { ...w, config: { ...base, ...patch } };
          }),
        }),
      resetWidgetConfig: (id) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (!widget) return;
        const plugin = getWidget(widget.type);
        if (!plugin) return;
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, config: plugin.defaultConfig() } : w,
          ),
        });
      },
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
        defaultTimeZone: state.defaultTimeZone,
      }),
    },
  ),
);

export function layoutForType(type: string) {
  return getWidget(type)?.layout ?? FALLBACK_LAYOUT;
}
