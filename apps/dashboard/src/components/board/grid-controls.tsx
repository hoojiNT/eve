import { Check, Languages, Plus, RotateCcw, SquarePen } from "lucide-react";
import { useState, type ReactNode } from "react";
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
import {
  BACKGROUND_IDS,
  backgroundOptionLabel,
  backgroundSwatch,
  normalizeHex,
  parseBackgroundId,
  resolveBackground,
} from "@/lib/background";
import { FONT_IDS, fontOptionLabel, parseFontId, resolveFont } from "@/lib/fonts";
import { WidgetPicker } from "@/components/board/widget-picker";
import { copy as dict } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { useBoardStore, type Density } from "@/store/board";

const COLS = [4, 6, 8, 12] as const;
const DENSITIES: Density[] = ["comfortable", "regular", "compact"];

export function GridControls({
  defaultOpen = false,
  open,
  onOpenChange,
  trigger,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactNode;
}) {
  const locale = useBoardStore((s) => s.locale);
  const isEditing = useBoardStore((s) => s.isEditing);
  const setEditing = useBoardStore((s) => s.setEditing);
  const setLocale = useBoardStore((s) => s.setLocale);
  const cols = useBoardStore((s) => s.cols);
  const density = useBoardStore((s) => s.density);
  const defaultTimeZone = useBoardStore((s) => s.defaultTimeZone);
  const fontId = useBoardStore((s) => s.fontId);
  const fontCustom = useBoardStore((s) => s.fontCustom);
  const backgroundId = useBoardStore((s) => s.backgroundId);
  const backgroundColor = useBoardStore((s) => s.backgroundColor);
  const backgroundImage = useBoardStore((s) => s.backgroundImage);
  const setCols = useBoardStore((s) => s.setCols);
  const setDensity = useBoardStore((s) => s.setDensity);
  const setDefaultTimeZone = useBoardStore((s) => s.setDefaultTimeZone);
  const setFontId = useBoardStore((s) => s.setFontId);
  const setFontCustom = useBoardStore((s) => s.setFontCustom);
  const setBackgroundId = useBoardStore((s) => s.setBackgroundId);
  const setBackgroundColor = useBoardStore((s) => s.setBackgroundColor);
  const setBackgroundImage = useBoardStore((s) => s.setBackgroundImage);
  const reset = useBoardStore((s) => s.reset);
  const copy = dict[locale];
  const [resetOpen, setResetOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const densityLabel: Record<Density, string> = {
    comfortable: copy.densityComfortable,
    regular: copy.densityRegular,
    compact: copy.densityCompact,
  };
  const resolvedFont = resolveFont(fontId, fontCustom);
  const resolvedBackground = resolveBackground(backgroundId, backgroundColor, backgroundImage);
  const customHex = normalizeHex(backgroundColor) ?? "#0a0a0c";

  return (
    <>
      <DropdownMenu
        open={open}
        onOpenChange={onOpenChange}
        defaultOpen={open === undefined ? defaultOpen : undefined}
      >
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="center"
          sideOffset={12}
          collisionPadding={16}
          className="max-h-[min(32rem,calc(100dvh-7rem))] w-64 overflow-auto"
          onPointerDownOutside={(event) => {
            const active = document.activeElement;
            if (active instanceof HTMLInputElement && active.type === "color") {
              event.preventDefault();
            }
          }}
        >
          <DropdownMenuItem
            onSelect={() => {
              setEditing(!isEditing);
              if (!isEditing) toast(copy.dragHint);
            }}
          >
            {isEditing ? <Check className="size-4" /> : <SquarePen className="size-4" />}
            {isEditing ? copy.done : copy.edit}
          </DropdownMenuItem>
          {isEditing ? (
            <DropdownMenuItem onSelect={() => setPickerOpen(true)}>
              <Plus className="size-4" />
              {copy.addWidget}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setLocale(locale === "vi" ? "en" : "vi");
            }}
          >
            <Languages className="size-4" />
            {copy.language}
            <span className="ml-auto text-xs tracking-wide text-subtle uppercase">{locale}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
                  cols === n
                    ? "bg-accent text-accent-fg"
                    : "bg-surface-2 text-fg hover:bg-surface-2/80",
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
          <DropdownMenuLabel>{copy.font}</DropdownMenuLabel>
          <div className="px-1.5 pb-2">
            <select
              aria-label={copy.font}
              value={fontId}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setFontId(parseFontId(e.target.value))}
              className="h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
              style={{ fontFamily: resolvedFont.display }}
            >
              {FONT_IDS.map((id) => (
                <option key={id} value={id}>
                  {fontOptionLabel(id, copy)}
                </option>
              ))}
            </select>
            {fontId === "custom" ? (
              <input
                value={fontCustom}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setFontCustom(e.target.value)}
                placeholder={copy.fontCustomPlaceholder}
                autoComplete="off"
                spellCheck={false}
                className="mt-1.5 h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
              />
            ) : null}
            <p
              className="mt-1.5 truncate px-0.5 text-sm text-muted"
              style={{ fontFamily: resolvedFont.display }}
            >
              {copy.fontPreview}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{copy.background}</DropdownMenuLabel>
          <div className="px-1.5 pb-2" data-board-background>
            <div className="grid grid-cols-5 gap-1" role="group" aria-label={copy.background}>
              {BACKGROUND_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-label={backgroundOptionLabel(id, copy)}
                  aria-pressed={backgroundId === id}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setBackgroundId(parseBackgroundId(id));
                  }}
                  className={cn(
                    "h-11 rounded-md shadow-[var(--shadow-border)]",
                    backgroundId === id && "ring-2 ring-fg",
                  )}
                  style={{
                    background:
                      id === "custom" && !normalizeHex(backgroundColor)
                        ? "conic-gradient(from 180deg, #8f4d3a, #c8d0dc, #1a2236, #163028, #8f4d3a)"
                        : backgroundSwatch(id, backgroundColor),
                  }}
                />
              ))}
            </div>
            <p className="mt-1.5 px-0.5 text-sm text-muted">
              {backgroundOptionLabel(backgroundId, copy)}
            </p>
            {backgroundId === "custom" ? (
              <div className="mt-1.5 flex gap-1.5">
                <input
                  type="color"
                  aria-label={copy.backgroundColor}
                  value={customHex}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-md bg-transparent p-1 shadow-[var(--shadow-border)]"
                />
                <input
                  value={backgroundColor}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#0a0a0c"
                  aria-label={copy.backgroundColor}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11 min-w-0 flex-1 rounded-md bg-surface-2 px-3 font-mono text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
                />
              </div>
            ) : null}
            <input
              value={backgroundImage}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => setBackgroundImage(e.target.value)}
              placeholder={copy.backgroundImagePlaceholder}
              aria-label={copy.backgroundImage}
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              className="mt-1.5 h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            />
            <div
              className="mt-1.5 h-10 rounded-md shadow-[var(--shadow-border)]"
              style={{
                backgroundColor: resolvedBackground.color ?? "#0a0a0c",
                backgroundImage: resolvedBackground.image ?? undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-hidden
            />
          </div>
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

      <WidgetPicker copy={copy} locale={locale} open={pickerOpen} onOpenChange={setPickerOpen} />

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
