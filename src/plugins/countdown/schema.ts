import { z } from "zod";

const INHERIT_TIME_ZONE = "default";

export type CountdownConfig = {
  mode: "gregorian" | "lunar";
  timeZone: string;
};

const schema = z.object({
  mode: z.enum(["gregorian", "lunar"]).default("gregorian"),
  timeZone: z.string().min(1).default(INHERIT_TIME_ZONE),
});

export function defaultCountdownConfig(): CountdownConfig {
  return { mode: "gregorian", timeZone: INHERIT_TIME_ZONE };
}

export function parseCountdownConfig(raw: unknown): CountdownConfig {
  try {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return defaultCountdownConfig();
    return { mode: parsed.data.mode, timeZone: parsed.data.timeZone };
  } catch {
    return defaultCountdownConfig();
  }
}
