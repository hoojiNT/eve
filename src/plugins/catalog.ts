import { clockPlugin } from "./clock";
import { countdownPlugin } from "./countdown";
import { notePlugin } from "./note";
import { progressPlugin } from "./progress";
import { registerWidget } from "./registry";

let registered = false;

/** Idempotent. Call from the dashboard entry so bundlers keep this module. */
export function registerFirstPartyPlugins() {
  if (registered) return;
  registered = true;
  registerWidget(countdownPlugin);
  registerWidget(clockPlugin);
  registerWidget(progressPlugin);
  registerWidget(notePlugin);
}
