import { GripVertical, Settings, Trash2 } from "lucide-react";
import { Suspense, useState, type CSSProperties, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { LazyWidgetSettingsDialog } from "@/components/board/lazy";
import { ClockWidget } from "@/components/widgets/clock";
import { CountdownWidget } from "@/components/widgets/countdown";
import { NoteWidget } from "@/components/widgets/note";
import { ProgressWidget } from "@/components/widgets/progress";
import type { Copy, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type {
  ClockConfig,
  CountdownConfig,
  NoteConfig,
  ProgressConfig,
  WidgetInstance,
} from "@/store/board";
import { useBoardStore } from "@/store/board";

export function WidgetBody({
  widget,
  copy,
  locale,
  compact,
}: {
  widget: WidgetInstance;
  copy: Copy;
  locale: Locale;
  compact?: boolean;
}) {
  const updateConfig = useBoardStore((s) => s.updateConfig);

  switch (widget.type) {
    case "countdown":
      return (
        <CountdownWidget
          config={widget.config as CountdownConfig}
          copy={copy}
          compact={compact}
        />
      );
    case "clock":
      return <ClockWidget config={widget.config as ClockConfig} copy={copy} locale={locale} />;
    case "progress":
      return <ProgressWidget config={widget.config as ProgressConfig} copy={copy} />;
    case "note":
      return (
        <NoteWidget
          config={widget.config as NoteConfig}
          copy={copy}
          onChange={(next) => updateConfig<"note">(widget.id, next)}
        />
      );
  }
}

const TITLES: Record<WidgetInstance["type"], (c: Copy) => string> = {
  countdown: (c) => c.countdown,
  clock: (c) => c.clock,
  progress: (c) => c.progress,
  note: (c) => c.note,
};

export function WidgetFrame({
  widget,
  copy,
  locale,
  isEditing,
  canArrange,
  compact,
  isDragging,
  onMoveStart,
  onResizeStart,
  onDelete,
  style,
  className,
}: {
  widget: WidgetInstance;
  copy: Copy;
  locale: Locale;
  isEditing: boolean;
  canArrange: boolean;
  compact?: boolean;
  isDragging?: boolean;
  onMoveStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onResizeStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onDelete: () => void;
  style: CSSProperties;
  className?: string;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const title = TITLES[widget.type](copy);

  return (
    <article
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-surface p-4 text-fg shadow-[var(--shadow-border)]",
        isDragging && "z-20 shadow-[var(--shadow-border-hover),var(--shadow-lift)]",
        isEditing && "ring-1 ring-fg/8 select-none",
        className,
      )}
      style={style}
    >
      {isEditing ? (
        <div className="absolute inset-x-2 top-2 z-10 mb-0 flex shrink-0 items-center gap-1 rounded-md bg-surface/90">
          {canArrange ? (
            <button
              type="button"
              aria-label="Move"
              onPointerDown={onMoveStart}
              className="flex size-11 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg touch-none"
            >
              <GripVertical className="size-4" />
            </button>
          ) : (
            <span className="w-2" />
          )}
          <span className="min-w-0 flex-1 truncate text-xs font-medium tracking-wide text-muted">
            {title}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={copy.settings}
            onPointerEnter={() => {
              void import("./widget-settings-dialog");
            }}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={copy.delete}
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : null}

      <div className={cn("min-h-0 flex-1", isEditing && "pt-11")}>
        <WidgetBody widget={widget} copy={copy} locale={locale} compact={compact} />
      </div>

      {isEditing && canArrange ? (
        <button
          type="button"
          aria-label="Resize"
          onPointerDown={onResizeStart}
          className="absolute right-1.5 bottom-1.5 size-11 cursor-nwse-resize touch-none"
        >
          <span className="absolute right-2 bottom-2 size-2.5 border-r-2 border-b-2 border-muted" />
        </button>
      ) : null}

      {settingsOpen ? (
        <Suspense fallback={null}>
          <LazyWidgetSettingsDialog
            widget={widget}
            copy={copy}
            locale={locale}
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
          />
        </Suspense>
      ) : null}
    </article>
  );
}
