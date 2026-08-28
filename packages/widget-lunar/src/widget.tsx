import { DEFAULT_TIME_ZONE, getLunarDateInTimeZone, resolveWidgetTimeZone } from "@eve/widget-shared";
import { useHostNow, useWidgetHost } from "@eve/dashboard-host";
import type { WidgetRenderProps } from "@eve/widget-sdk";
import { lunarCopy } from "./copy";
import type { LunarConfig } from "./schema";

export function LunarWidget({ config }: WidgetRenderProps<LunarConfig>) {
  const { locale, defaultTimeZone } = useWidgetHost();
  const now = useHostNow();
  const tz = resolveWidgetTimeZone(config.timeZone, defaultTimeZone);
  const copy = lunarCopy[locale];
  // The Vietnamese lunar calendar is a fixed national calendar, always anchored to
  // Vietnam's own calendar day — not the viewer's chosen display timezone. `tz` only
  // affects the secondary Gregorian date/weekday label below.
  const lunar = getLunarDateInTimeZone(now, DEFAULT_TIME_ZONE);

  const solarLabel = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-1.5 text-center">
      <p
        suppressHydrationWarning
        className="font-display text-3xl leading-none font-medium tracking-tight tabular-nums text-fg"
      >
        {lunar.day}/{lunar.month}
        {lunar.isLeapMonth ? <span className="ml-1.5 text-sm font-normal text-muted">({copy.leap})</span> : null}
      </p>
      <p suppressHydrationWarning className="text-xs tabular-nums text-muted">
        {copy.yearPrefix} {lunar.year}
      </p>
      <p suppressHydrationWarning className="mt-1.5 text-xs capitalize text-muted">
        {solarLabel}
      </p>
    </div>
  );
}
