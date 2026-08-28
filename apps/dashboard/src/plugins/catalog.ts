import { clockPlugin } from "@eve/widget-clock";
import { countdownPlugin } from "@eve/widget-countdown";
import { lunarPlugin } from "@eve/widget-lunar";
import { notePlugin } from "@eve/widget-note";
import { progressPlugin } from "@eve/widget-progress";
import { registerWidget } from "@eve/widget-sdk";

let registered = false;

/** Idempotent. Call from the dashboard entry so bundlers keep this module. */
export function registerFirstPartyPlugins() {
  if (registered) return;
  registered = true;
  registerWidget(countdownPlugin);
  registerWidget(clockPlugin);
  registerWidget(lunarPlugin);
  registerWidget(progressPlugin);
  registerWidget(notePlugin);
}
