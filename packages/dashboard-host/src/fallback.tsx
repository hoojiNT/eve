import { Button } from "@eve/ui";
import { getWidget } from "@eve/widget-sdk";
import { hostCopy } from "./copy";
import { useWidgetHost } from "./host-context";

export function WidgetSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3" aria-hidden="true">
      <div className="h-3 w-24 rounded-sm bg-surface-2" />
      <div className="h-8 w-40 rounded-sm bg-surface-2" />
      <div className="min-h-0 flex-1 rounded-md bg-surface-2" />
    </div>
  );
}

export function WidgetCrashFallback({
  type,
  onRetry,
  onResetConfig,
}: {
  type: string;
  onRetry: () => void;
  onResetConfig?: () => void;
}) {
  const { locale } = useWidgetHost();
  const copy = hostCopy[locale];
  const plugin = getWidget(type);
  const title = plugin ? plugin.display.title(locale) : copy.widgetUnavailable;

  return (
    <div className="flex h-full min-h-0 flex-col justify-between gap-3">
      <div>
        <p className="text-xs font-medium tracking-caps text-subtle uppercase">{title}</p>
        <p className="mt-2 font-display text-lg font-medium tracking-tight text-fg">{copy.widgetError}</p>
        <p className="mt-1 text-sm text-muted">{copy.widgetErrorBody}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
          {copy.retry}
        </Button>
        {onResetConfig ? (
          <Button type="button" size="sm" variant="ghost" onClick={onResetConfig}>
            {copy.resetConfig}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
