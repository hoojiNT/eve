import type { AnyWidgetPlugin } from "./types";

export type IsolatedResolution =
  | { status: "unknown" }
  | { status: "ready"; plugin: AnyWidgetPlugin; config: unknown };

export function resolveIsolatedWidget(
  type: string,
  config: unknown,
  lookup: (type: string) => AnyWidgetPlugin | undefined,
): IsolatedResolution {
  const plugin = lookup(type);
  if (!plugin) return { status: "unknown" };
  let parsed: unknown;
  try {
    parsed = plugin.parseConfig(config);
  } catch {
    parsed = plugin.defaultConfig();
  }
  return { status: "ready", plugin, config: parsed };
}
