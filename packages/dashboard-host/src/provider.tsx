import type { ReactNode } from "react";
import type { WidgetHost } from "@eve/widget-sdk";
import { HostContext, NowProvider } from "./host-context";

export { useHostNow, useWidgetHost } from "./host-context";

/**
 * Generic host provider — app-agnostic. Takes an already-built `WidgetHost`
 * value; the app owns wiring that value up to its own state (store, i18n).
 */
export function DashboardHostProvider({ host, children }: { host: WidgetHost; children: ReactNode }) {
  return (
    <HostContext.Provider value={host}>
      <NowProvider>{children}</NowProvider>
    </HostContext.Provider>
  );
}
