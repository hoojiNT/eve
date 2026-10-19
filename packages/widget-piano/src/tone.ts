const PARTIALS = [1, 2, 3.01, 4.02];
const PARTIAL_GAINS = [1, 0.35, 0.18, 0.08];

let shared: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return null;
  if (!shared) shared = new window.AudioContext();
  return shared;
}

/** One soft strike. Safe to call from a click handler: it never throws. */
export function playTone(midi: number, volume: number) {
  try {
    const level = Math.min(1, Math.max(0, volume));
    if (level <= 0) return;
    const ctx = audioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const freq = 440 * 2 ** ((midi - 69) / 12);
    const master = ctx.createGain();
    const peak = Math.max(level * 0.22, 0.0001);
    // Exponential ramps cannot land on zero.
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(peak, now + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    master.connect(ctx.destination);

    for (let i = 0; i < PARTIALS.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * PARTIALS[i]!, now);
      const partial = ctx.createGain();
      partial.gain.value = PARTIAL_GAINS[i] ?? 0;
      osc.connect(partial);
      partial.connect(master);
      osc.start(now);
      osc.stop(now + 1.45);
    }
  } catch {
    // The host only catches render errors, so a failed audio graph must stay here.
  }
}
