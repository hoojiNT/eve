import { cn } from "@eve/ui";
import { isNewYearDay, remainingUntil, resolveWidgetTimeZone, yearProgress } from "@eve/widget-shared";
import { useHostNow, useWidgetHost } from "@eve/dashboard-host";
import type { WidgetRenderProps } from "@eve/widget-sdk";
import { countdownCopy } from "./copy";
import type { CountdownConfig } from "./schema";

function pad(value: number, size: number) {
  return String(value).padStart(size, "0");
}

function DigitValue({ value }: { value: string }) {
  return (
    <span suppressHydrationWarning className="inline-block tabular-nums">
      {value}
    </span>
  );
}

export function CountdownWidget({ config, compact }: WidgetRenderProps<CountdownConfig>) {
  const { locale, defaultTimeZone } = useWidgetHost();
  const copy = countdownCopy[locale];
  const tz = resolveWidgetTimeZone(config.timeZone, defaultTimeZone);
  const now = useHostNow();
  const remaining = remainingUntil(now, tz, config.mode);
  const progress = yearProgress(now, tz);
  const celebrating = isNewYearDay(now, tz, config.mode);
  const eve = remaining.days === 0 && !celebrating;

  const units = [
    { key: "days", label: copy.days, value: pad(remaining.days, remaining.days >= 100 ? 3 : 2) },
    { key: "hours", label: copy.hours, value: pad(remaining.hours, 2) },
    { key: "minutes", label: copy.minutes, value: pad(remaining.minutes, 2) },
    { key: "seconds", label: copy.seconds, value: pad(remaining.seconds, 2) },
  ];

  const heading =
    config.mode === "lunar"
      ? `${copy.lunarTitle} ${remaining.targetYear}`
      : `${copy.gregorianTitle} ${remaining.targetYear}`;

  return (
    <div className="flex h-full min-h-0 flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-caps text-subtle uppercase">
            {celebrating ? copy.happyNewYear : eve ? copy.newYearEve : copy.remaining}
          </p>
          <h2
            suppressHydrationWarning
            className="mt-1 font-display text-year leading-tight font-medium tracking-tight text-fg"
          >
            {heading}
          </h2>
        </div>
        <span className="hidden text-right text-xs text-subtle sm:block">{tz.replace(/_/g, " ")}</span>
      </div>

      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
        {units.map((unit) => (
          <div
            key={unit.key}
            className="flex flex-col items-center justify-center rounded-md bg-surface-2 px-2 py-3 sm:py-4"
          >
            <div
              className={cn(
                "font-display leading-none font-medium tracking-tight text-fg",
                compact ? "text-3xl sm:text-4xl" : "text-count",
              )}
            >
              <DigitValue value={unit.value} />
            </div>
            <div className="mt-2 text-unit tracking-caps text-muted uppercase">{unit.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            suppressHydrationWarning
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.round(progress.ratio * 100)}%` }}
          />
        </div>
        <span suppressHydrationWarning className="shrink-0 text-xs tabular-nums text-muted">
          {Math.round(progress.ratio * 100)}% {copy.yearProgress} {progress.year}
        </span>
      </div>
    </div>
  );
}
