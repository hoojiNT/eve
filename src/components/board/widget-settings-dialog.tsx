import { Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Copy, Locale } from "@/lib/i18n";
import { IsolatedSettings, WidgetErrorBoundary, WidgetSkeleton } from "@/plugins/isolate";
import { getWidget } from "@/plugins/registry";
import type { WidgetInstance } from "@/store/board";
import { useBoardStore } from "@/store/board";

export function WidgetSettingsDialog({
  widget,
  copy,
  locale: _locale,
  open,
  onOpenChange,
}: {
  widget: WidgetInstance;
  copy: Copy;
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const resetWidgetConfig = useBoardStore((s) => s.resetWidgetConfig);
  const plugin = getWidget(widget.type);
  const title = plugin ? plugin.display.title(copy) : copy.widgetUnavailable;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.settings}</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <WidgetErrorBoundary
          instanceId={`${widget.id}-settings`}
          type={widget.type}
          onResetConfig={() => resetWidgetConfig(widget.id)}
        >
          <Suspense fallback={<WidgetSkeleton />}>
            <IsolatedSettings widget={widget} />
          </Suspense>
        </WidgetErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
