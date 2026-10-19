import { SlidersHorizontal, X } from "lucide";
import { MorphIcon } from "morphicons/react";
import { Suspense, useEffect, useState, type ComponentProps } from "react";
import { cn } from "@eve/ui";
import { LazyGridControls } from "@/components/board/lazy";
import { copy as dict } from "@/lib/i18n";
import { useBoardStore } from "@/store/board";

export function BoardHeader() {
  const locale = useBoardStore((s) => s.locale);
  const copy = dict[locale];
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancel = false;
    void import("./grid-controls").then(() => {
      if (!cancel) setReady(true);
    });
    return () => {
      cancel = true;
    };
  }, []);

  const button = (
    <DockButton
      label={copy.boardMenu}
      open={open}
      onClick={() => {
        if (!ready) {
          setReady(true);
          setOpen(true);
        }
      }}
    />
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto">
        {ready ? (
          <Suspense fallback={button}>
            <LazyGridControls open={open} onOpenChange={setOpen} trigger={button} />
          </Suspense>
        ) : (
          button
        )}
      </div>
    </div>
  );
}

function DockButton({
  label,
  open,
  className,
  ...props
}: ComponentProps<"button"> & { label: string; open: boolean }) {
  const isEditing = useBoardStore((s) => s.isEditing);

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      className={cn(
        "liquid-glass relative flex size-14 items-center justify-center overflow-hidden rounded-full text-fg shadow-[var(--shadow-border),var(--shadow-lift)] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none",
        isEditing && "ring-2 ring-fg",
        className,
      )}
      {...props}
    >
      <MorphIcon
        icon={open ? X : SlidersHorizontal}
        size={20}
        strokeWidth={2}
        spring="snappy"
        reducedMotion="user"
        className="relative z-[1]"
      />
    </button>
  );
}
