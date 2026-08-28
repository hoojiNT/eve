import { LayoutGrid, RotateCcw } from "lucide-react";
import { useState } from "react";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@eve/ui";
import { TIMEZONES } from "@eve/widget-shared";
import { copy as dict } from "@/lib/i18n";
import { useBoardStore, type Density } from "@/store/board";

const COLS = [4, 6, 8, 12] as const;
const DENSITIES: Density[] = ["comfortable", "regular", "compact"];

export function GridControls({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const locale = useBoardStore((s) => s.locale);
  const cols = useBoardStore((s) => s.cols);
  const density = useBoardStore((s) => s.density);
  const defaultTimeZone = useBoardStore((s) => s.defaultTimeZone);
  const setCols = useBoardStore((s) => s.setCols);
  const setDensity = useBoardStore((s) => s.setDensity);
  const setDefaultTimeZone = useBoardStore((s) => s.setDefaultTimeZone);
  const reset = useBoardStore((s) => s.reset);
  const copy = dict[locale];
  const [resetOpen, setResetOpen] = useState(false);

  const densityLabel: Record<Density, string> = {
    comfortable: copy.densityComfortable,
    regular: copy.densityRegular,
    compact: copy.densityCompact,
  };

  return (
    <>
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <LayoutGrid className="size-4" />
            <span className="hidden sm:inline">{copy.grid}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{copy.columns}</DropdownMenuLabel>
          <div className="grid grid-cols-4 gap-1 px-1.5 pb-2">
            {COLS.map((n) => (
              <button
                key={n}
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  setCols(n);
                }}
                className={cn(
                  "h-11 rounded-md text-sm font-medium tabular-nums",
                  cols === n ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg hover:bg-surface-2/80",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{copy.density}</DropdownMenuLabel>
          {DENSITIES.map((d) => (
            <DropdownMenuItem key={d} onSelect={() => setDensity(d)}>
              <span className={cn("flex-1", density === d && "text-fg")}>{densityLabel[d]}</span>
              {density === d ? <span className="text-subtle">·</span> : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{copy.defaultTimeZone}</DropdownMenuLabel>
          <div className="px-1.5 pb-2">
            <select
              value={defaultTimeZone}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setDefaultTimeZone(e.target.value)}
              className="h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            >
              {TIMEZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {locale === "vi" ? z.labelVi : z.labelEn}
                </option>
              ))}
            </select>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setResetOpen(true)}>
            <RotateCcw className="size-4" />
            {copy.reset}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.reset}</DialogTitle>
            <DialogDescription>{copy.resetConfirm}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              {copy.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                reset();
                setResetOpen(false);
              }}
            >
              {copy.resetAction}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
