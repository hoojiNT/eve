import type { CountdownMode } from "@/lib/new-year";
import { cn } from "@/lib/utils";
import { useWidgetHost } from "../host-context";
import { TimeZoneField } from "../shared/time-zone-field";
import type { WidgetSettingsProps } from "../types";
import type { CountdownConfig } from "./schema";

export function CountdownSettings({ config, onChange }: WidgetSettingsProps<CountdownConfig>) {
  const { copy } = useWidgetHost();
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
        label={copy.timeZone}
        id="countdown-tz"
        onChange={(timeZone) => onChange({ timeZone })}
      />
    </div>
  );
}
