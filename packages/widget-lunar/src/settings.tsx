import { TimeZoneField } from "@eve/widget-shared";
import type { WidgetSettingsProps } from "@eve/widget-sdk";
import type { LunarConfig } from "./schema";

export function LunarSettings({ config, onChange }: WidgetSettingsProps<LunarConfig>) {
  return (
    <div className="flex flex-col gap-4">
      <TimeZoneField value={config.timeZone} id="lunar-tz" onChange={(timeZone) => onChange({ timeZone })} />
    </div>
  );
}
