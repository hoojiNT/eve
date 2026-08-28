import { Label } from "@eve/ui";
import { useWidgetHost } from "@eve/dashboard-host";
import { widgetSharedCopy } from "./copy";
import { TIMEZONES } from "./lunar-calendar";
import { INHERIT_TIME_ZONE } from "./time-zone";

export function TimeZoneField({
  value,
  onChange,
  id = "tz-field",
  allowInherit = true,
}: {
  value: string;
  onChange: (id: string) => void;
  id?: string;
  allowInherit?: boolean;
}) {
  const { locale } = useWidgetHost();
  const copy = widgetSharedCopy[locale];
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{copy.timeZone}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
      >
        {allowInherit ? <option value={INHERIT_TIME_ZONE}>{copy.tzDefault}</option> : null}
        {TIMEZONES.map((z) => (
          <option key={z.id} value={z.id}>
            {locale === "vi" ? z.labelVi : z.labelEn}
          </option>
        ))}
      </select>
    </div>
  );
}
