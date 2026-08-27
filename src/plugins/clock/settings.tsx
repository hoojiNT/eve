import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useWidgetHost } from "../host-context";
import { TimeZoneField } from "../shared/time-zone-field";
import type { WidgetSettingsProps } from "../types";
import type { ClockConfig } from "./schema";

export function ClockSettings({ config, onChange }: WidgetSettingsProps<ClockConfig>) {
  const { copy } = useWidgetHost();
  return (
    <div className="flex flex-col gap-4">
      <TimeZoneField
        value={config.timeZone}
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
