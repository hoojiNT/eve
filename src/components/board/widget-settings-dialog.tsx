import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClockSettings } from "@/components/widgets/clock";
import { CountdownSettings } from "@/components/widgets/countdown";
import { ProgressSettings } from "@/components/widgets/progress";
import type { Copy, Locale } from "@/lib/i18n";
import type {
  ClockConfig,
  CountdownConfig,
  ProgressConfig,
  WidgetInstance,
} from "@/store/board";
import { useBoardStore } from "@/store/board";

const TITLES: Record<WidgetInstance["type"], (c: Copy) => string> = {
  countdown: (c) => c.countdown,
  clock: (c) => c.clock,
  progress: (c) => c.progress,
  note: (c) => c.note,
};

function WidgetSettings({
  widget,
  copy,
  locale,
}: {
  widget: WidgetInstance;
  copy: Copy;
  locale: Locale;
}) {
  const updateConfig = useBoardStore((s) => s.updateConfig);
  switch (widget.type) {
    case "countdown":
      return (
        <CountdownSettings
          config={widget.config as CountdownConfig}
          copy={copy}
          locale={locale}
          onChange={(next) => updateConfig<"countdown">(widget.id, next)}
        />
      );
    case "clock":
      return (
        <ClockSettings
          config={widget.config as ClockConfig}
          copy={copy}
          locale={locale}
          onChange={(next) => updateConfig<"clock">(widget.id, next)}
        />
      );
    case "progress":
      return (
        <ProgressSettings
          config={widget.config as ProgressConfig}
          copy={copy}
          locale={locale}
          onChange={(next) => updateConfig<"progress">(widget.id, next)}
        />
      );
    case "note":
      return <p className="text-sm text-muted">{copy.noteDesc}</p>;
  }
}

export function WidgetSettingsDialog({
  widget,
  copy,
  locale,
  open,
  onOpenChange,
}: {
  widget: WidgetInstance;
  copy: Copy;
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.settings}</DialogTitle>
          <DialogDescription>{TITLES[widget.type](copy)}</DialogDescription>
        </DialogHeader>
        <WidgetSettings widget={widget} copy={copy} locale={locale} />
      </DialogContent>
    </Dialog>
  );
}
