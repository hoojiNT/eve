import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { WidgetHost } from "./types";

export const HostContext = createContext<WidgetHost | null>(null);
export const NowContext = createContext<Date | null>(null);

export function NowProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);
  return <NowContext.Provider value={now}>{children}</NowContext.Provider>;
}

export function useWidgetHost(): WidgetHost {
  const host = useContext(HostContext);
  if (!host) {
    throw new Error("useWidgetHost must be used inside DashboardHostProvider");
  }
  return host;
}

/** Subscribe only if the plugin needs the shared clock. Note must not call this. */
export function useHostNow(): Date {
  const now = useContext(NowContext);
  if (!now) {
    throw new Error("useHostNow must be used inside DashboardHostProvider");
  }
  return now;
}
