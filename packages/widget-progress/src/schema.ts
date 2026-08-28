import { z } from "zod";

const INHERIT_TIME_ZONE = "default";

export type ProgressConfig = {
  timeZone: string;
};

const schema = z.object({
  timeZone: z.string().min(1).default(INHERIT_TIME_ZONE),
});

export function defaultProgressConfig(): ProgressConfig {
  return { timeZone: INHERIT_TIME_ZONE };
}

export function parseProgressConfig(raw: unknown): ProgressConfig {
  try {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return defaultProgressConfig();
    return { timeZone: parsed.data.timeZone };
  } catch {
    return defaultProgressConfig();
  }
}
