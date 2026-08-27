import { getDateTimeInTimeZone, resolveTimeZone } from "@/lib/new-year";
import type { Copy, Locale } from "@/lib/i18n";
import type { ClockConfig } from "@/store/board";
import { cn } from "@/lib/utils";
import { TimeZoneField } from "@/components/widgets/countdown";
import { Label } from "@/components/ui/label";
import { useNow } from "@/lib/use-now";

function AnalogFace({
  hour,
  minute,
  second,
  showSeconds,
}: {
  hour: number;
  minute: number;
  second: number;
  showSeconds: boolean;
}) {
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = (minute + second / 60) * 6;
  const secondAngle = second * 6;
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.25" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const inner = i % 3 === 0 ? 38 : 41;
        return (
          <line
            key={i}
            x1={50 + Math.sin(a) * inner}
            y1={50 - Math.cos(a) * inner}
            x2={50 + Math.sin(a) * 44}
            y2={50 - Math.cos(a) * 44}
            stroke="currentColor"
            strokeOpacity={i % 3 === 0 ? 0.55 : 0.22}
            strokeWidth={i % 3 === 0 ? 1.6 : 1}
            strokeLinecap="round"
          />
        );
      })}
      <g suppressHydrationWarning transform={`rotate(${hourAngle} 50 50)`}>
        <line x1="50" y1="50" x2="50" y2="28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <g suppressHydrationWarning transform={`rotate(${minuteAngle} 50 50)`}>
        <line x1="50" y1="52" x2="50" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      {showSeconds ? (
        <g suppressHydrationWarning transform={`rotate(${secondAngle} 50 50)`}>
          <line x1="50" y1="54" x2="50" y2="16" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.8" strokeLinecap="round" />
        </g>
      ) : null}
      <circle cx="50" cy="50" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function ClockWidget({
  config,
  locale,
}: {
  config: ClockConfig;
  copy: Copy;
  locale: Locale;
}) {
  const now = useNow(config.showSeconds ? 250 : 1000);
  const tz = resolveTimeZone(config.timeZone);
  const parts = getDateTimeInTimeZone(now, tz);

  const dateLabel = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  const timeLabel = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: config.showSeconds ? "2-digit" : undefined,
    hour12: config.hour12,
    hourCycle: config.hour12 ? undefined : "h23",
  }).format(now);

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3">
      <div className="aspect-square w-44 max-w-full text-fg">
        <AnalogFace hour={parts.hour} minute={parts.minute} second={parts.second} showSeconds={config.showSeconds} />
      </div>
      <div className="text-center">
        <p
          suppressHydrationWarning
          className="font-display text-2xl leading-none font-medium tracking-tight tabular-nums text-fg"
        >
          {timeLabel}
        </p>
        <p suppressHydrationWarning className="mt-1.5 text-xs capitalize text-muted">
          {dateLabel}
        </p>
      </div>
    </div>
  );
}

export function ClockSettings({
  config,
  copy,
  locale,
  onChange,
}: {
  config: ClockConfig;
  copy: Copy;
  locale: Locale;
  onChange: (next: Partial<ClockConfig>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <TimeZoneField
        value={config.timeZone}
        locale={locale}
        label={copy.timeZone}
        id="clock-tz"
        onChange={(timeZone) => onChange({ timeZone })}
      />
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-xs font-medium tracking-wide text-muted">{copy.format}</legend>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ hour12: false })}
            className={cn(
              "h-11 rounded-md px-3 text-sm font-medium",
              !config.hour12 ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg",
            )}
          >
            {copy.format24}
          </button>
          <button
            type="button"
            onClick={() => onChange({ hour12: true })}
            className={cn(
              "h-11 rounded-md px-3 text-sm font-medium",
              config.hour12 ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg",
            )}
          >
            {copy.format12}
          </button>
        </div>
      </fieldset>
      <label className="flex h-11 items-center justify-between gap-3 rounded-md bg-surface-2 px-3">
        <Label className="text-sm text-fg">{copy.showSeconds}</Label>
        <input
          type="checkbox"
          checked={config.showSeconds}
          onChange={(e) => onChange({ showSeconds: e.target.checked })}
          className="size-4 accent-accent"
        />
      </label>
    </div>
  );
}
