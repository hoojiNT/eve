import type { AnyWidgetPlugin, WidgetPlugin } from "./types";

export function createRegistry() {
  const plugins = new Map<string, AnyWidgetPlugin>();
  const order: string[] = [];

  function registerWidget<TConfig>(plugin: WidgetPlugin<TConfig>): void {
    const existing = plugins.get(plugin.type);
    if (existing) {
      console.warn(`[eve:plugin] replacing "${plugin.type}" (v${existing.version} → v${plugin.version})`);
    } else {
      order.push(plugin.type);
    }
    plugins.set(plugin.type, plugin as AnyWidgetPlugin);
  }

  function getWidget(type: string): AnyWidgetPlugin | undefined {
    return plugins.get(type);
  }

  function listWidgets(): AnyWidgetPlugin[] {
    return order
      .map((type) => plugins.get(type))
      .filter((plugin): plugin is AnyWidgetPlugin => plugin !== undefined);
  }

  function reset() {
    plugins.clear();
    order.length = 0;
  }

  return { registerWidget, getWidget, listWidgets, reset };
}

const globalRegistry = createRegistry();

export const registerWidget = globalRegistry.registerWidget;
export const getWidget = globalRegistry.getWidget;
export const listWidgets = globalRegistry.listWidgets;

/** Test-only. Do not call from app code. */
export const resetRegistryForTests = globalRegistry.reset;
