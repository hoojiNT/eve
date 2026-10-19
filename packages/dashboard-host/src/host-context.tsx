import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { WidgetHost } from "@eve/widget-sdk";
import { delayUntilNextBucket, truncateToBucket } from "./clock";

export type HostClockResolution = "second" | "minute";

const SECOND_MS = 1_000;
const MINUTE_MS = 60_000;

export const HostContext = createContext<WidgetHost | null>(null);
const SecondContext = createContext<number | null>(null);
const MinuteContext = createContext<number | null>(null);

function useWallSecond(): number {
  const [second, setSecond] = useState(() => truncateToBucket(Date.now(), SECOND_MS));

  useEffect(() => {
    let timer = 0;
    let stopped = false;

    const publish = () => {
      const next = truncateToBucket(Date.now(), SECOND_MS);
      setSecond((current) => (current === next ? current : next));
    };

    const arm = () => {
      if (stopped) return;
      timer = window.setTimeout(() => {
        publish();
        arm();
      }, delayUntilNextBucket(Date.now(), SECOND_MS));
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(timer);
      publish();
      arm();
    };

    publish();
    arm();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return second;
}

export function NowProvider({ children }: { children: ReactNode }) {
  const second = useWallSecond();
  const minute = truncateToBucket(second, MINUTE_MS);
  return (
    <SecondContext.Provider value={second}>
      <MinuteContext.Provider value={minute}>{children}</MinuteContext.Provider>
    </SecondContext.Provider>
  );
}

export function useWidgetHost(): WidgetHost {
  const host = useContext(HostContext);
  if (!host) {
    throw new Error("useWidgetHost must be used inside DashboardHostProvider");
  }
  return host;
}

/**
 * Subscribe only if the plugin needs the shared clock. Note must not call this.
 * One context per call: reading both would re-render minute subscribers every second.
 */
export function useHostNow(resolution: HostClockResolution = "second"): Date {
  const ms = useContext(resolution === "minute" ? MinuteContext : SecondContext);
  if (ms == null) {
    throw new Error("useHostNow must be used inside DashboardHostProvider");
  }
  return new Date(ms);
}
