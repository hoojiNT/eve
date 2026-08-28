import { hostCopy } from "./copy";
import { useWidgetHost } from "./host-context";

export function UnknownWidget({ type }: { type: string }) {
  const { locale } = useWidgetHost();
  const copy = hostCopy[locale];
  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-2">
      <p className="text-xs font-medium tracking-caps text-subtle uppercase">{type}</p>
      <p className="font-display text-lg font-medium tracking-tight text-fg">{copy.widgetUnavailable}</p>
      <p className="text-sm text-muted">{copy.widgetUnavailableBody}</p>
    </div>
  );
}
