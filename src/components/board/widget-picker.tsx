import { Clock, StickyNote, Timer, Orbit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Copy } from "@/lib/i18n";
import { useBoardStore, type WidgetType } from "@/store/board";
import { useState, type ReactNode } from "react";

const ITEMS: {
  type: WidgetType;
  icon: typeof Timer;
  title: (c: Copy) => string;
  desc: (c: Copy) => string;
}[] = [
  { type: "countdown", icon: Timer, title: (c) => c.countdown, desc: (c) => c.countdownDesc },
  { type: "clock", icon: Clock, title: (c) => c.clock, desc: (c) => c.clockDesc },
  { type: "progress", icon: Orbit, title: (c) => c.progress, desc: (c) => c.progressDesc },
  { type: "note", icon: StickyNote, title: (c) => c.note, desc: (c) => c.noteDesc },
];

export function WidgetPicker({
  copy,
  trigger,
}: {
  copy: Copy;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const addWidget = useBoardStore((s) => s.addWidget);

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
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  addWidget(item.type);
                  setOpen(false);
                }}
                className="flex items-start gap-3 rounded-lg bg-surface-2 p-3.5 text-left hover:bg-surface-2/80 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface text-fg shadow-[var(--shadow-border)]">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">{item.title(copy)}</span>
                  <span className="mt-0.5 block text-sm text-muted">{item.desc(copy)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
