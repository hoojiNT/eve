import { z } from "zod";

export type NoteConfig = {
  title: string;
  text: string;
};

const schema = z.object({
  title: z.string().default(""),
  text: z.string().default(""),
});

export function defaultNoteConfig(): NoteConfig {
  return { title: "", text: "" };
}

export function parseNoteConfig(raw: unknown): NoteConfig {
  try {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return defaultNoteConfig();
    return { title: parsed.data.title, text: parsed.data.text };
  } catch {
    return defaultNoteConfig();
  }
}
