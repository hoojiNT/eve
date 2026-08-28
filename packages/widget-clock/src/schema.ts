import { z } from "zod";

const INHERIT_TIME_ZONE = "default";

export type ClockConfig = {
  timeZone: string;
  hour12: boolean;
  showSeconds: boolean;
};

const schema = z.object({
  timeZone: z.string().min(1).default(INHERIT_TIME_ZONE),
  hour12: z.boolean().default(false),
  showSeconds: z.boolean().default(true),
});

export function defaultClockConfig(): ClockConfig {
  return { timeZone: INHERIT_TIME_ZONE, hour12: false, showSeconds: true };
}

export function parseClockConfig(raw: unknown): ClockConfig {
  try {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return defaultClockConfig();
    return {
      timeZone: parsed.data.timeZone,
      hour12: parsed.data.hour12,
      showSeconds: parsed.data.showSeconds,
    };
  } catch {
    return defaultClockConfig();
  }
}
