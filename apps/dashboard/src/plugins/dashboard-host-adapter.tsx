import { useMemo, type ReactNode } from "react";
import { DashboardHostProvider as GenericDashboardHostProvider } from "@eve/dashboard-host";
import { DEFAULT_TIME_ZONE } from "@eve/widget-shared";
import type { WidgetHost } from "@eve/widget-sdk";
import { useBoardStore } from "@/store/board";

export { useHostNow, useWidgetHost } from "@eve/dashboard-host";

/** Bridges the app's zustand board store into the generic @eve/dashboard-host provider. */
export function DashboardHostProvider({ children }: { children: ReactNode }) {
  const locale = useBoardStore((s) => s.locale);
  const isEditing = useBoardStore((s) => s.isEditing);
  const defaultTimeZone = useBoardStore((s) => s.defaultTimeZone);
  const updateConfig = useBoardStore((s) => s.updateConfig);

  const host = useMemo<WidgetHost>(
    () => ({
      locale,
      defaultTimeZone: defaultTimeZone || DEFAULT_TIME_ZONE,
      isEditing,
      updateConfig,
    }),
    [locale, defaultTimeZone, isEditing, updateConfig],
  );

  return <GenericDashboardHostProvider host={host}>{children}</GenericDashboardHostProvider>;
}
