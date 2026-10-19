/** Two octaves, C4 through C6 inclusive. */
export const FIRST_MIDI = 60;
export const LAST_MIDI = 84;

/** Black key width as a fraction of one white key. */
export const BLACK_WIDTH_RATIO = 0.62;

/** Black key height as a fraction of the white keys. */
export const BLACK_HEIGHT_RATIO = 0.62;

const PITCHES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export type PianoKey = {
  midi: number;
  pitch: (typeof PITCHES)[number];
  octave: number;
  /** Spoken and flying-note label, e.g. C4 or C♯4. */
  label: string;
  black: boolean;
  /** This white key's index, or the white key immediately to the left of a black key. */
  whiteIndex: number;
};

export function formatLabel(pitch: string, octave: number): string {
  return pitch.includes("#") ? `${pitch[0]}♯${octave}` : `${pitch}${octave}`;
}

export function pianoKeys(): PianoKey[] {
  const keys: PianoKey[] = [];
  let whiteIndex = -1;
  for (let midi = FIRST_MIDI; midi <= LAST_MIDI; midi++) {
    const pitch = PITCHES[midi % 12] ?? "C";
    const black = pitch.includes("#");
    if (!black) whiteIndex += 1;
    const octave = Math.floor(midi / 12) - 1;
    keys.push({
      midi,
      pitch,
      octave,
      label: formatLabel(pitch, octave),
      black,
      whiteIndex,
    });
  }
  return keys;
}

export function blackKeyFrame(whiteIndex: number, whiteCount: number) {
  return {
    centerPercent: ((whiteIndex + 1) / whiteCount) * 100,
    widthPercent: (BLACK_WIDTH_RATIO / whiteCount) * 100,
  };
}
