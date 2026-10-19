import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { blackKeyFrame, pianoKeys } from "./keys.ts";

describe("pianoKeys", () => {
  const keys = pianoKeys();
  const whites = keys.filter((key) => !key.black);
  const blacks = keys.filter((key) => key.black);

  it("covers C4 through C6", () => {
    assert.equal(keys.length, 25);
    assert.equal(whites.length, 15);
    assert.equal(blacks.length, 10);
    assert.deepEqual(
      { midi: keys[0]?.midi, label: keys[0]?.label },
      { midi: 60, label: "C4" },
    );
    assert.deepEqual(
      { midi: keys.at(-1)?.midi, label: keys.at(-1)?.label },
      { midi: 84, label: "C6" },
    );
    assert.equal(keys.find((key) => key.midi === 69)?.label, "A4");
  });

  it("places black keys only after C, D, F, G, and A", () => {
    assert.deepEqual(
      blacks.map((key) => key.pitch),
      ["C#", "D#", "F#", "G#", "A#", "C#", "D#", "F#", "G#", "A#"],
    );
    assert.ok(blacks.every((key) => key.label.includes("♯")));
    assert.equal(blacks[0]?.label, "C♯4");
    assert.equal(blacks[0]?.whiteIndex, 0);
  });

  it("centers the first black key on the gap after the first white key", () => {
    const frame = blackKeyFrame(0, whites.length);
    assert.ok(Math.abs(frame.centerPercent - 100 / 15) < 0.0001);
    assert.ok(Math.abs(frame.widthPercent - (0.62 / 15) * 100) < 0.0001);
  });
});
