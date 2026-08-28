import { Label } from "@eve/ui";
import { cn } from "@eve/ui";
import { useWidgetHost } from "@eve/dashboard-host";
import { TimeZoneField } from "@eve/widget-shared";
import type { WidgetSettingsProps } from "@eve/widget-sdk";
import { clockCopy } from "./copy";
import type { ClockConfig } from "./schema";

export function ClockSettings({ config, onChange }: WidgetSettingsProps<ClockConfig>) {
  const { locale } = useWidgetHost();
  const copy = clockCopy[locale];
  return (
    <div className="flex flex-col gap-4">
      <TimeZoneField value={config.timeZone} id="clock-tz" onChange={(timeZone) => onChange({ timeZone })} />
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
