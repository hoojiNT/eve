import { cn } from "@eve/ui";
import {
  getLunarDetails,
  resolveWidgetTimeZone,
  SOLAR_TERM_NAMES,
  type MoonPhaseName,
} from "@eve/widget-shared";
import { useHostNow, useWidgetHost } from "@eve/dashboard-host";
import type { WidgetRenderProps } from "@eve/widget-sdk";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { lunarCopy } from "./copy";
import { MoonDisc } from "./moon-disc";
import type { LunarConfig } from "./schema";

const PHASE_COPY = {
  new: "phaseNew",
  waxingCrescent: "phaseWaxingCrescent",
  firstQuarter: "phaseFirstQuarter",
  waxingGibbous: "phaseWaxingGibbous",
  full: "phaseFull",
  waningGibbous: "phaseWaningGibbous",
  lastQuarter: "phaseLastQuarter",
  waningCrescent: "phaseWaningCrescent",
} as const satisfies Record<MoonPhaseName, keyof (typeof lunarCopy)["vi"]>;

const SWAP =
  "transition-[opacity,transform] duration-[var(--motion-medium)] ease-[var(--ease-smooth-out)]";

function useFineHover() {
  const [fineHover, setFineHover] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFineHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return fineHover;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-[10px] font-medium tracking-caps text-subtle uppercase">{label}</dt>
      <dd suppressHydrationWarning className="min-w-0 truncate text-right text-xs text-fg">
        {value}
      </dd>
    </div>
  );
}

export function LunarWidget({ config, compact }: WidgetRenderProps<LunarConfig>) {
  const { locale, defaultTimeZone, isEditing } = useWidgetHost();
  const now = useHostNow();
  const tz = resolveWidgetTimeZone(config.timeZone, defaultTimeZone);
  const copy = lunarCopy[locale];
  const fineHover = useFineHover();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const minute = Math.floor(now.getTime() / 60_000);
  const details = useMemo(() => getLunarDetails(new Date(minute * 60_000)), [minute]);

  useEffect(() => {
    if (isEditing) setOpen(false);
  }, [isEditing]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const { lunar } = details;
  const interactive = !isEditing;
  const cssReveal = interactive && fineHover === true;
  const tapReveal = interactive && fineHover === false && open;
  const restHidden = cssReveal
    ? "group-hover:opacity-0 group-hover:-translate-y-1 group-hover:scale-[0.97] group-focus-visible:opacity-0 group-focus-visible:-translate-y-1 group-focus-visible:scale-[0.97]"
    : tapReveal
      ? "opacity-0 -translate-y-1 scale-[0.97]"
      : "";
  const detailsShown = cssReveal
    ? "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0"
    : tapReveal
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-2";

  const leap = lunar.isLeapMonth ? ` (${copy.leap})` : "";
  const monthLine = `${copy.monthPrefix} ${lunar.month}${leap}`;
  const special = lunar.day === 1 ? copy.soc : lunar.day === 15 ? copy.ram : null;
  const phaseLabel = copy[PHASE_COPY[details.moon.name]];
  const illumination = `${Math.round(details.moon.illumination * 100)}%`;
  const termName = SOLAR_TERM_NAMES[locale][details.termIndex] ?? "";
  const solarLabel = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const nextValue = details.next
    ? details.next.days === 0
      ? copy.today
      : `${details.next.days} ${copy.daysUnit}`
    : null;

  const summary = `${copy.title}: ${lunar.day} ${monthLine}, ${details.year.label}`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (event.key === "Escape" && open) {
      setOpen(false);
      return;
    }
    if (fineHover === false && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setOpen((value) => !value);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "group relative h-full min-h-0 rounded-md outline-none select-none",
        interactive && "focus-visible:ring-1 focus-visible:ring-fg/20",
        fineHover === false && interactive && "cursor-pointer",
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive && fineHover === false ? "button" : undefined}
      aria-expanded={interactive && fineHover === false ? open : undefined}
      aria-label={summary}
      onClick={() => {
        if (interactive && fineHover === false) setOpen((value) => !value);
      }}
      onKeyDown={onKeyDown}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex flex-col items-center justify-center overflow-hidden text-center",
          SWAP,
          restHidden,
        )}
        aria-hidden="true"
      >
        <p className="text-[10px] font-medium tracking-caps text-subtle uppercase">{copy.title}</p>
        <div className={cn("mt-1.5 text-fg", compact ? "size-16" : "size-20")}>
          <MoonDisc
            phaseDeg={details.moon.phaseDeg}
            illumination={details.moon.illumination}
            className="size-full"
          />
        </div>
        <p
          suppressHydrationWarning
          className={cn(
            "mt-1.5 font-display leading-none font-medium tracking-tight tabular-nums text-fg",
            compact ? "text-3xl" : "text-4xl",
          )}
        >
          {lunar.day}
        </p>
        <p suppressHydrationWarning className="mt-1 text-xs text-muted">
          {special ? `${special} · ` : null}
          {monthLine}
        </p>
        <p suppressHydrationWarning className="mt-0.5 text-xs text-subtle">
          {details.year.label}
        </p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex flex-col justify-center overflow-hidden",
          SWAP,
          detailsShown,
        )}
        aria-hidden="true"
      >
        <p
          suppressHydrationWarning
          className="font-display text-lg leading-tight font-medium tracking-tight text-fg"
        >
          {lunar.day} {monthLine}
        </p>
        <p suppressHydrationWarning className="mt-0.5 text-xs text-subtle">
          {details.year.label}
        </p>
        <dl className={cn("mt-2.5 flex flex-col", compact ? "gap-1" : "gap-1.5")}>
          <DetailRow label={copy.year} value={details.year.label} />
          <DetailRow label={copy.month} value={details.month.label} />
          <DetailRow label={copy.day} value={details.day.label} />
        </dl>
        <dl className={cn("mt-1.5 flex flex-col border-t border-border pt-1.5", compact ? "gap-1" : "gap-1.5")}>
          <DetailRow label={copy.solar} value={solarLabel} />
          <DetailRow label={copy.phase} value={`${phaseLabel} · ${illumination}`} />
          <DetailRow label={copy.term} value={termName} />
          {details.next && nextValue ? (
            <DetailRow
              label={details.next.kind === "full" ? copy.nextFull : copy.nextNew}
              value={nextValue}
            />
          ) : null}
        </dl>
      </div>
    </div>
  );
}
