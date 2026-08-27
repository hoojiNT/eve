import { resolveTimeZone, yearProgress } from "@/lib/new-year";
import type { Copy, Locale } from "@/lib/i18n";
import type { ProgressConfig } from "@/store/board";
import { TimeZoneField } from "@/components/widgets/countdown";
import { useNow } from "@/lib/use-now";

export function ProgressWidget({
  config,
  copy,
}: {
  config: ProgressConfig;
  copy: Copy;
}) {
  const now = useNow(30_000);
  const tz = resolveTimeZone(config.timeZone);
  const stats = yearProgress(now, tz);
  const daysInYear = Math.round(stats.total / 86400000);
  const day = Math.min(Math.floor(stats.elapsed / 86400000) + 1, daysInYear);
  const pct = Math.round(Math.min(100, stats.ratio * 100));
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = Math.round(c * stats.ratio);

  return (
    <div className="flex h-full min-h-0 items-center gap-5">
      <div className="relative size-28 shrink-0 text-fg">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6" />
          <circle
            suppressHydrationWarning
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${Math.round(c)}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span suppressHydrationWarning className="font-display text-xl font-medium tabular-nums">
            {pct}%
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-caps text-subtle uppercase">{copy.progress}</p>
        <p suppressHydrationWarning className="mt-1 font-display text-2xl leading-tight font-medium tracking-tight">
          {stats.year}
        </p>
        <p suppressHydrationWarning className="mt-1 text-sm text-muted">
          {copy.dayOf} {day}
          <span className="text-subtle"> / {daysInYear}</span>
        </p>
      </div>
    </div>
  );
}

export function ProgressSettings({
  config,
  copy,
  locale,
  onChange,
}: {
  config: ProgressConfig;
  copy: Copy;
  locale: Locale;
  onChange: (next: Partial<ProgressConfig>) => void;
}) {
  return (
    <TimeZoneField
      value={config.timeZone}
      locale={locale}
      label={copy.timeZone}
      id="progress-tz"
      onChange={(timeZone) => onChange({ timeZone })}
    />
  );
}
