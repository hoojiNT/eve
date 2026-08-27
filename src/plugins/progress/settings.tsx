import { useWidgetHost } from "../host-context";
import { TimeZoneField } from "../shared/time-zone-field";
import type { WidgetSettingsProps } from "../types";
import type { ProgressConfig } from "./schema";

export function ProgressSettings({ config, onChange }: WidgetSettingsProps<ProgressConfig>) {
  const { copy } = useWidgetHost();
  return (
    <TimeZoneField
      value={config.timeZone}
      label={copy.timeZone}
      id="progress-tz"
      onChange={(timeZone) => onChange({ timeZone })}
    />
  );
}
