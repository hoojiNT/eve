import { lazy } from "react";

export const LazyAppToaster = lazy(() =>
  import("./app-toaster").then((m) => ({ default: m.AppToaster })),
);

export const LazyGridControls = lazy(() =>
  import("./grid-controls").then((m) => ({ default: m.GridControls })),
);

export const LazyWidgetPicker = lazy(() =>
  import("./widget-picker").then((m) => ({ default: m.WidgetPicker })),
);

export const LazyWidgetSettingsDialog = lazy(() =>
  import("./widget-settings-dialog").then((m) => ({ default: m.WidgetSettingsDialog })),
);

export function preloadEditChrome() {
  void import("./grid-controls");
  void import("./widget-picker");
  void import("./widget-settings-dialog");
  void import("./app-toaster");
  void import("sonner");
}
