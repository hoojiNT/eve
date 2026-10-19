import { z } from "zod";

export type PianoConfig = {
  volume: number;
};

const schema = z.object({
  volume: z.number().min(0).max(1).default(0.7),
});

export function defaultPianoConfig(): PianoConfig {
  return { volume: 0.7 };
}

export function parsePianoConfig(raw: unknown): PianoConfig {
  try {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return defaultPianoConfig();
    return { volume: parsed.data.volume };
  } catch {
    return defaultPianoConfig();
  }
}
