import { SlidersHorizontal } from "lucide-react";
import { Suspense, useState, type ComponentProps } from "react";
import { cn } from "@eve/ui";
import { LazyGridControls } from "@/components/board/lazy";
import { copy as dict } from "@/lib/i18n";
import { useBoardStore } from "@/store/board";

export function BoardHeader() {
  const locale = useBoardStore((s) => s.locale);
  const copy = dict[locale];
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  const preload = () => {
    void import("./grid-controls");
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto">
        {ready ? (
          <Suspense fallback={<DockButton label={copy.boardMenu} />}>
            <LazyGridControls defaultOpen={open} trigger={<DockButton label={copy.boardMenu} />} />
          </Suspense>
        ) : (
          <DockButton
            label={copy.boardMenu}
            onPointerEnter={preload}
            onFocus={preload}
            onClick={() => {
              preload();
              setOpen(true);
              setReady(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

function DockButton({ label, className, ...props }: ComponentProps<"button"> & { label: string }) {
  const isEditing = useBoardStore((s) => s.isEditing);

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "liquid-glass relative flex size-14 items-center justify-center overflow-hidden rounded-full text-fg shadow-[var(--shadow-border),var(--shadow-lift)] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none",
        isEditing && "ring-2 ring-fg",
        className,
      )}
      {...props}
    >
      <SlidersHorizontal className="relative z-[1] size-5" />
    </button>
  );
}
