import { Label } from "@eve/ui";
import { useWidgetHost } from "@eve/dashboard-host";
import type { WidgetSettingsProps } from "@eve/widget-sdk";
import { pianoCopy } from "./copy";
import type { PianoConfig } from "./schema";

export function PianoSettings({ instanceId, config, onChange }: WidgetSettingsProps<PianoConfig>) {
  const { locale } = useWidgetHost();
  const copy = pianoCopy[locale];
  const id = `piano-volume-${instanceId}`;
  const percent = Math.round(config.volume * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{copy.volume}</Label>
        <span className="text-xs tabular-nums text-muted">{percent}</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        onChange={(event) => onChange({ volume: Number(event.target.value) / 100 })}
        className="h-11 w-full accent-accent"
      />
    </div>
  );
}
