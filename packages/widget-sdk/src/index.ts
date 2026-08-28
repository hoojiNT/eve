export type {
  Locale,
  WidgetHost,
  WidgetLayout,
  WidgetRenderProps,
  WidgetSettingsProps,
  WidgetPlugin,
  AnyWidgetPlugin,
} from "./types";
export { FALLBACK_LAYOUT } from "./types";
export { createRegistry, registerWidget, getWidget, listWidgets, resetRegistryForTests } from "./registry";
export { resolveIsolatedWidget, type IsolatedResolution } from "./resolve";
