import { Suspense, useEffect, useState } from "react";
import { LazyAppToaster, preloadEditChrome } from "@/components/board/lazy";
import { BoardCanvas } from "@/components/board/board-canvas";
import { BoardHeader } from "@/components/board/board-header";
import { registerFirstPartyPlugins } from "@/plugins/catalog";
import { DashboardHostProvider } from "@/plugins/dashboard-host-adapter";
import { useBoardStore } from "@/store/board";

registerFirstPartyPlugins();

export function AppShell() {
  const [chrome, setChrome] = useState(false);

  useEffect(() => {
    void Promise.resolve(useBoardStore.persist.rehydrate());
    setChrome(true);
    const idle = window.requestIdleCallback?.bind(window);
    if (idle) {
      const id = idle(() => preloadEditChrome());
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => preloadEditChrome(), 1);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <DashboardHostProvider>
      <div className="min-h-dvh bg-bg text-fg">
        <BoardHeader />
        <BoardCanvas />
        {chrome ? (
          <Suspense fallback={null}>
            <LazyAppToaster />
          </Suspense>
        ) : null}
      </div>
    </DashboardHostProvider>
  );
}
