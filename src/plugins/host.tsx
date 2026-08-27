import { useMemo, type ReactNode } from "react";
import { copy as dict } from "@/lib/i18n";
import { useBoardStore } from "@/store/board";
import { HostContext, NowProvider } from "./host-context";
import { DEFAULT_TIME_ZONE } from "./shared/time-zone";
import type { WidgetHost } from "./types";

export { useHostNow, useWidgetHost } from "./host-context";

export function DashboardHostProvider({ children }: { children: ReactNode }) {
  const locale = useBoardStore((s) => s.locale);
  const isEditing = useBoardStore((s) => s.isEditing);
  const defaultTimeZone = useBoardStore((s) => s.defaultTimeZone);
  const updateConfig = useBoardStore((s) => s.updateConfig);
  const copy = dict[locale];

  const host = useMemo<WidgetHost>(
    () => ({
      locale,
      copy,
      defaultTimeZone: defaultTimeZone || DEFAULT_TIME_ZONE,
      isEditing,
      updateConfig,
    }),
    [locale, copy, defaultTimeZone, isEditing, updateConfig],
  );

  return (
    <HostContext.Provider value={host}>
      <NowProvider>{children}</NowProvider>
    </HostContext.Provider>
  );
}
