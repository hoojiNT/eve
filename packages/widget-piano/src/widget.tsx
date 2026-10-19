import { cn } from "@eve/ui";
import type { WidgetRenderProps } from "@eve/widget-sdk";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { BLACK_HEIGHT_RATIO, blackKeyFrame, pianoKeys, type PianoKey } from "./keys";
import type { PianoConfig } from "./schema";
import { playTone } from "./tone";

type FlyingNote = {
  id: number;
  label: string;
  x: number;
  rise: number;
  drift: number;
};

const KEYS = pianoKeys();
const WHITES = KEYS.filter((key) => !key.black);
const BLACKS = KEYS.filter((key) => key.black);
const WHITE_COUNT = WHITES.length;

export function PianoWidget({ config }: WidgetRenderProps<PianoConfig>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const [pressed, setPressed] = useState<ReadonlySet<number>>(() => new Set());
  const [flying, setFlying] = useState<FlyingNote[]>([]);

  const dismiss = useCallback((id: number) => {
    setFlying((prev) => prev.filter((note) => note.id !== id));
  }, []);

  function hold(midi: number, down: boolean) {
    setPressed((prev) => {
      if (down === prev.has(midi)) return prev;
      const next = new Set(prev);
      if (down) next.add(midi);
      else next.delete(midi);
      return next;
    });
  }

  function strike(key: PianoKey, origin: HTMLElement) {
    playTone(key.midi, config.volume);
    const stage = stageRef.current;
    if (!stage) return;
    const stageBox = stage.getBoundingClientRect();
    const keyBox = origin.getBoundingClientRect();
    const note: FlyingNote = {
      id: ++seq.current,
      label: key.label,
      x: keyBox.left + keyBox.width / 2 - stageBox.left,
      rise: Math.max(36, stage.clientHeight * 0.92),
      drift: (Math.random() - 0.5) * 28,
    };
    setFlying((prev) => (prev.length > 29 ? [...prev.slice(-29), note] : [...prev, note]));
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, key: PianoKey) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    hold(key.midi, true);
    strike(key, event.currentTarget);
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>, key: PianoKey) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    hold(key.midi, false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, key: PianoKey) {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    hold(key.midi, true);
    strike(key, event.currentTarget);
  }

  function onKeyUp(event: KeyboardEvent<HTMLButtonElement>, key: PianoKey) {
    if (event.key !== "Enter" && event.key !== " ") return;
    hold(key.midi, false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden">
        {flying.map((note) => (
          <FlyingGlyph key={note.id} note={note} onDone={dismiss} />
        ))}
      </div>
      <div className="@container/keys relative h-[58%] min-h-28 shrink-0 touch-none">
        <div className="absolute inset-0 flex">
          {WHITES.map((key, index) => (
            <KeyButton
              key={key.midi}
              pianoKey={key}
              pressed={pressed.has(key.midi)}
              className={cn(
                "relative h-full min-w-0 flex-1 bg-[#f2f1ee] text-[#6e6e76] shadow-[inset_-1px_0_0_rgba(20,16,12,0.14),inset_0_-12px_16px_rgba(20,16,12,0.12)]",
                index === 0 && "rounded-bl-md",
                index === WHITES.length - 1 && "rounded-br-md",
                pressed.has(key.midi) && "translate-y-0.5 bg-[#d8d6d0]",
              )}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
            >
              <span className="pointer-events-none absolute inset-x-0 bottom-1 hidden truncate text-center font-display text-[10px] leading-none @[15rem]/keys:block">
                {key.pitch}
              </span>
            </KeyButton>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: `${BLACK_HEIGHT_RATIO * 100}%` }}
        >
          {BLACKS.map((key) => {
            const frame = blackKeyFrame(key.whiteIndex, WHITE_COUNT);
            const down = pressed.has(key.midi);
            return (
              <KeyButton
                key={key.midi}
                pianoKey={key}
                pressed={down}
                className={cn(
                  "pointer-events-auto absolute top-0 h-full rounded-b-[3px] bg-[#141418] shadow-[inset_0_-8px_10px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.08)]",
                  down && "bg-[#3a3a42]",
                )}
                style={{
                  left: `${frame.centerPercent}%`,
                  width: `${frame.widthPercent}%`,
                  transform: down ? "translateX(-50%) translateY(1px)" : "translateX(-50%)",
                }}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KeyButton({
  pianoKey,
  pressed,
  className,
  style,
  children,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
}: {
  pianoKey: PianoKey;
  pressed: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>, key: PianoKey) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>, key: PianoKey) => void;
  onPointerCancel: (event: PointerEvent<HTMLButtonElement>, key: PianoKey) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, key: PianoKey) => void;
  onKeyUp: (event: KeyboardEvent<HTMLButtonElement>, key: PianoKey) => void;
}) {
  return (
    <button
      type="button"
      data-piano-key={pianoKey.label}
      aria-label={pianoKey.label}
      aria-pressed={pressed}
      className={cn(
        "focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        className,
      )}
      style={style}
      onPointerDown={(event) => onPointerDown(event, pianoKey)}
      onPointerUp={(event) => onPointerUp(event, pianoKey)}
      onPointerCancel={(event) => onPointerCancel(event, pianoKey)}
      onKeyDown={(event) => onKeyDown(event, pianoKey)}
      onKeyUp={(event) => onKeyUp(event, pianoKey)}
    >
      {children}
    </button>
  );
}

function FlyingGlyph({ note, onDone }: { note: FlyingNote; onDone: (id: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") {
      const backup = window.setTimeout(() => onDone(note.id), 1100);
      return () => window.clearTimeout(backup);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 180 : 1100;
    const anim = el.animate(
      reduce
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { transform: "translate(-50%, 0) rotate(-8deg)", opacity: 1 },
            {
              transform: `translate(calc(-50% + ${note.drift}px), -${note.rise}px) rotate(10deg)`,
              opacity: 0,
            },
          ],
      { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
    );
    anim.onfinish = () => onDone(note.id);
    const backup = window.setTimeout(() => onDone(note.id), duration + 80);
    return () => {
      window.clearTimeout(backup);
      anim.onfinish = null;
      anim.cancel();
    };
  }, [note.drift, note.id, note.rise, onDone]);

  return (
    <span
      ref={ref}
      data-flying-note={note.label}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 font-display text-sm whitespace-nowrap text-[#f2f1ee]"
      style={{ left: note.x, transform: "translate(-50%, 0)" }}
    >
      ♪ {note.label}
    </span>
  );
}
