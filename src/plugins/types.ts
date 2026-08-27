import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { Copy, Locale } from "@/lib/i18n";

/**
 * Host API plugins may read. Plugins must not import the board store.
 * Event handlers inside a plugin should not throw — Error Boundaries catch
 * render errors only, not clicks or timers.
 */
export type WidgetHost = {
  locale: Locale;
  copy: Copy;
  defaultTimeZone: string;
  isEditing: boolean;
  updateConfig: (instanceId: string, patch: Record<string, unknown>) => void;
};

export type WidgetLayout = {
  w: number;
  h: number;
  minW: number;
  minH: number;
};

export type WidgetRenderProps<TConfig> = {
  instanceId: string;
  config: TConfig;
  compact: boolean;
};

export type WidgetSettingsProps<TConfig> = {
  instanceId: string;
  config: TConfig;
  onChange: (patch: Partial<TConfig>) => void;
};

export type WidgetPlugin<TConfig = unknown> = {
  type: string;
  version: number;
  display: {
    title: (copy: Copy) => string;
    description: (copy: Copy) => string;
    icon: LucideIcon;
  };
  layout: WidgetLayout;
  defaultConfig: () => TConfig;
  /** Must never throw. Invalid persist data returns defaultConfig(). */
  parseConfig: (raw: unknown) => TConfig;
  Widget: ComponentType<WidgetRenderProps<TConfig>>;
  Settings?: ComponentType<WidgetSettingsProps<TConfig>>;
};

/** Registry stores plugins with opaque config. */
export type AnyWidgetPlugin = WidgetPlugin<unknown>;

export const FALLBACK_LAYOUT: WidgetLayout = { w: 4, h: 3, minW: 2, minH: 2 };
