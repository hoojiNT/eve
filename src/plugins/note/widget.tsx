import { Textarea } from "@/components/ui/textarea";
import { useWidgetHost } from "../host-context";
import type { WidgetRenderProps } from "../types";
import type { NoteConfig } from "./schema";

export function NoteWidget({ instanceId, config }: WidgetRenderProps<NoteConfig>) {
  const { copy, updateConfig } = useWidgetHost();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="mb-2 text-xs font-medium tracking-caps text-subtle uppercase">{copy.noteTitle}</p>
      <Textarea
        value={config.text}
        placeholder={copy.notePlaceholder}
        onChange={(e) => updateConfig(instanceId, { text: e.target.value })}
        className="min-h-0 flex-1 font-display text-lg leading-relaxed"
      />
    </div>
  );
}
