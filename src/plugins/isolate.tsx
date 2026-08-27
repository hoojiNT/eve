import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import type { WidgetInstance } from "@/store/board";
import { WidgetCrashFallback, WidgetSkeleton } from "./fallback";
import { useWidgetHost } from "./host-context";
import { getWidget } from "./registry";
import { resolveIsolatedWidget } from "./resolve";
import { UnknownWidget } from "./unknown";

type BoundaryProps = {
  instanceId: string;
  type: string;
  onResetConfig?: () => void;
  children: ReactNode;
};

type BoundaryState = { error: Error | null };

export class WidgetErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[eve:widget]", this.props.type, this.props.instanceId, error, info.componentStack);
  }

  componentDidUpdate(prev: BoundaryProps) {
    if (prev.instanceId !== this.props.instanceId && this.state.error) {
      this.setState({ error: null });
    }
  }

  retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <WidgetCrashFallback
          type={this.props.type}
          onRetry={this.retry}
          onResetConfig={
            this.props.onResetConfig
              ? () => {
                  this.props.onResetConfig?.();
                  this.retry();
                }
              : undefined
          }
        />
      );
    }
    return this.props.children;
  }
}

export function IsolatedWidget({
  widget,
  compact,
}: {
  widget: WidgetInstance;
  compact?: boolean;
}) {
  const resolved = resolveIsolatedWidget(widget.type, widget.config, getWidget);
  if (resolved.status === "unknown") {
    return <UnknownWidget type={widget.type} />;
  }
  const Widget = resolved.plugin.Widget;
  return (
    <>
      <DevCrash type={widget.type} />
      <Widget instanceId={widget.id} config={resolved.config} compact={Boolean(compact)} />
    </>
  );
}

export function IsolatedSettings({ widget }: { widget: WidgetInstance }) {
  const { copy, updateConfig } = useWidgetHost();
  const resolved = resolveIsolatedWidget(widget.type, widget.config, getWidget);
  if (resolved.status === "unknown") {
    return <p className="text-sm text-muted">{copy.widgetUnavailableBody}</p>;
  }
  const Settings = resolved.plugin.Settings;
  if (!Settings) {
    return <p className="text-sm text-muted">{resolved.plugin.display.description(copy)}</p>;
  }
  return (
    <Settings
      instanceId={widget.id}
      config={resolved.config}
      onChange={(patch) => updateConfig(widget.id, patch as Record<string, unknown>)}
    />
  );
}

export { WidgetSkeleton };

function DevCrash({ type }: { type: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (import.meta.env.DEV) setArmed(true);
  }, []);
  if (!armed || typeof window === "undefined") return null;
  const crash = new URLSearchParams(window.location.search).get("crash");
  if (crash && crash === type) {
    throw new Error(`dev crash: ${type}`);
  }
  return null;
}
