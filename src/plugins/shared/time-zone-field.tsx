import { Label } from "@/components/ui/label";
import { TIMEZONES } from "@/lib/new-year";
import { useWidgetHost } from "../host-context";
import { INHERIT_TIME_ZONE } from "./time-zone";

export function TimeZoneField({
  value,
  label,
  onChange,
  id = "tz-field",
  allowInherit = true,
}: {
  value: string;
  label: string;
  onChange: (id: string) => void;
  id?: string;
  allowInherit?: boolean;
}) {
  const { copy, locale } = useWidgetHost();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
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
