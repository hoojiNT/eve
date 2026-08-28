import { z } from "zod";

const INHERIT_TIME_ZONE = "default";

export type LunarConfig = {
  timeZone: string;
};

const schema = z.object({
  timeZone: z.string().min(1).default(INHERIT_TIME_ZONE),
});

export function defaultLunarConfig(): LunarConfig {
  return { timeZone: INHERIT_TIME_ZONE };
}

export function parseLunarConfig(raw: unknown): LunarConfig {
  try {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return defaultLunarConfig();
    return { timeZone: parsed.data.timeZone };
  } catch {
    return defaultLunarConfig();
  }
}
