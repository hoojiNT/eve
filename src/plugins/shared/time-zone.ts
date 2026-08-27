import { resolveTimeZone } from "@/lib/new-year";

export const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
export const INHERIT_TIME_ZONE = "default";

export function resolveWidgetTimeZone(configured: string, defaultTimeZone: string): string {
  const id =
    !configured || configured === INHERIT_TIME_ZONE ? defaultTimeZone : configured;
  return resolveTimeZone(id);
}
