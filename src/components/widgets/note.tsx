import type { Copy } from "@/lib/i18n";
import type { NoteConfig } from "@/store/board";
import { Textarea } from "@/components/ui/textarea";

export function NoteWidget({
  config,
  copy,
  onChange,
}: {
  config: NoteConfig;
  copy: Copy;
  onChange: (next: Partial<NoteConfig>) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="mb-2 text-xs font-medium tracking-caps text-subtle uppercase">{copy.noteTitle}</p>
      <Textarea
        value={config.text}
        placeholder={copy.notePlaceholder}
        onChange={(e) => onChange({ text: e.target.value })}
        className="min-h-0 flex-1 font-display text-lg leading-relaxed"
      />
    </div>
  );
}
