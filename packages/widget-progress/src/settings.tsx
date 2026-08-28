import { TimeZoneField } from "@eve/widget-shared";
import type { WidgetSettingsProps } from "@eve/widget-sdk";
import type { ProgressConfig } from "./schema";

export function ProgressSettings({ config, onChange }: WidgetSettingsProps<ProgressConfig>) {
  return (
    <TimeZoneField value={config.timeZone} id="progress-tz" onChange={(timeZone) => onChange({ timeZone })} />
  );
}
