import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@eve/ui";
import { listWidgets } from "@eve/widget-sdk";
import type { Copy, Locale } from "@/lib/i18n";
import { useBoardStore } from "@/store/board";
import { useState, type ReactNode } from "react";

export function WidgetPicker({
  copy,
  locale,
  trigger,
}: {
  copy: Copy;
  locale: Locale;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const addWidget = useBoardStore((s) => s.addWidget);
  const items = listWidgets();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary" size="sm">
            {copy.addWidget}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.addWidgetTitle}</DialogTitle>
          <DialogDescription>{copy.addWidgetHint}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid gap-2">
          {items.map((plugin) => {
            const Icon = plugin.display.icon;
            return (
              <button
                key={plugin.type}
                type="button"
                onClick={() => {
                  addWidget(plugin.type);
                  setOpen(false);
                }}
                className="flex items-start gap-3 rounded-lg bg-surface-2 p-3.5 text-left hover:bg-surface-2/80 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface text-fg shadow-[var(--shadow-border)]">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">{plugin.display.title(locale)}</span>
                  <span className="mt-0.5 block text-sm text-muted">{plugin.display.description(locale)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
