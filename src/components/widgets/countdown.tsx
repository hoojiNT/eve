import {
  isNewYearDay,
  remainingUntil,
  resolveTimeZone,
  TIMEZONES,
  yearProgress,
  type CountdownMode,
} from "@/lib/new-year";
import type { Copy, Locale } from "@/lib/i18n";
import type { CountdownConfig } from "@/store/board";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useNow } from "@/lib/use-now";

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

export function CountdownWidget({
  config,
  copy,
  compact,
}: {
  config: CountdownConfig;
  copy: Copy;
  compact?: boolean;
}) {
  const tz = resolveTimeZone(config.timeZone);
  const now = useNow(250);
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
          <h2 suppressHydrationWarning className="mt-1 font-display text-year leading-tight font-medium tracking-tight text-fg">
            {heading}
          </h2>
        </div>
        <span className="hidden text-right text-xs text-subtle sm:block">
          {tz.replace(/_/g, " ")}
        </span>
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

export function TimeZoneField({
  value,
  locale,
  label,
  onChange,
  id = "tz-field",
}: {
  value: string;
  locale: Locale;
  label: string;
  onChange: (id: string) => void;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
      >
        {TIMEZONES.map((z) => (
          <option key={z.id} value={z.id}>
            {locale === "vi" ? z.labelVi : z.labelEn}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CountdownSettings({
  config,
  copy,
  locale,
  onChange,
}: {
  config: CountdownConfig;
  copy: Copy;
  locale: Locale;
  onChange: (next: Partial<CountdownConfig>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-xs font-medium tracking-wide text-muted">{copy.mode}</legend>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              ["gregorian", copy.gregorian],
              ["lunar", copy.lunar],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ mode: mode as CountdownMode })}
              className={cn(
                "h-11 rounded-md px-3 text-sm font-medium",
                config.mode === mode
                  ? "bg-accent text-accent-fg"
                  : "bg-surface-2 text-fg hover:bg-surface-2/80",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <TimeZoneField
        value={config.timeZone}
        locale={locale}
        label={copy.timeZone}
        id="countdown-tz"
        onChange={(timeZone) => onChange({ timeZone })}
      />
    </div>
  );
}
