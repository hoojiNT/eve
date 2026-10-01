export const BACKGROUND_IDS = ["default", "night", "lantern", "pine", "custom"] as const;

export type BackgroundId = (typeof BACKGROUND_IDS)[number];

export const DEFAULT_BACKGROUND_ID: BackgroundId = "default";

/** Dark veil so light UI text stays readable over a photo. */
const IMAGE_VEIL = "linear-gradient(rgba(10,10,12,0.42), rgba(10,10,12,0.68))";

const PRESETS: Record<
  Exclude<BackgroundId, "custom">,
  { swatch: string; color: string; image: string | null }
> = {
  default: { swatch: "#0a0a0c", color: "#0a0a0c", image: null },
  night: {
    swatch: "#1a2236",
    color: "#0a0a0c",
    image: "radial-gradient(120% 80% at 50% -10%, #24304a 0%, #0a0a0c 58%)",
  },
  lantern: {
    swatch: "#3a2414",
    color: "#0c0a09",
    image: "radial-gradient(90% 55% at 50% 115%, #5a3418 0%, #1a100c 42%, #0c0a09 70%)",
  },
  pine: {
    swatch: "#163028",
    color: "#0a0c0b",
    image: "radial-gradient(80% 70% at 100% 0%, #1c3a30 0%, #0a0c0b 55%)",
  },
};

const BACKGROUND_ID_SET = new Set<string>(BACKGROUND_IDS);

/** https only, and no characters that can break out of CSS url("…"). */
const IMAGE_URL = /^https:\/\/[A-Za-z0-9._~:/?#\[\]@!$&'*+,;=%-]{1,2000}$/;

export type ResolvedBackground = {
  id: BackgroundId;
  /** null keeps the designed page color. */
  color: string | null;
  image: string | null;
  swatch: string;
};

export function parseBackgroundId(value: unknown): BackgroundId {
  if (typeof value === "string" && BACKGROUND_ID_SET.has(value)) return value as BackgroundId;
  return DEFAULT_BACKGROUND_ID;
}

export function parseBackgroundColor(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 7);
}

export function parseBackgroundImage(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 2000);
}

/** #rgb or #rrggbb, with or without the leading hash. */
export function normalizeHex(value: string): string | null {
  const match = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(value.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  return `#${hex.toLowerCase()}`;
}

export function isSafeImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!IMAGE_URL.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return (
      url.protocol === "https:" && url.username === "" && url.password === "" && url.hostname !== ""
    );
  } catch {
    return false;
  }
}

export function backgroundSwatch(id: BackgroundId, color: unknown): string {
  if (id === "custom") return normalizeHex(parseBackgroundColor(color)) ?? PRESETS.default.swatch;
  return PRESETS[id].swatch;
}

export function backgroundOptionLabel(
  id: BackgroundId,
  copy: {
    backgroundDefault: string;
    backgroundNight: string;
    backgroundLantern: string;
    backgroundPine: string;
    backgroundCustom: string;
  },
): string {
  if (id === "default") return copy.backgroundDefault;
  if (id === "night") return copy.backgroundNight;
  if (id === "lantern") return copy.backgroundLantern;
  if (id === "pine") return copy.backgroundPine;
  return copy.backgroundCustom;
}

function photoLayer(image: unknown): string | null {
  const url = parseBackgroundImage(image);
  if (!isSafeImageUrl(url)) return null;
  return `${IMAGE_VEIL}, url("${url}")`;
}

export function resolveBackground(
  backgroundId: unknown,
  backgroundColor: unknown = "",
  backgroundImage: unknown = "",
): ResolvedBackground {
  const id = parseBackgroundId(backgroundId);
  const photo = photoLayer(backgroundImage);
  if (id === "custom") {
    const color = normalizeHex(parseBackgroundColor(backgroundColor)) ?? PRESETS.default.color;
    return { id, color, image: photo, swatch: color };
  }
  const preset = PRESETS[id];
  if (id === "default" && !photo) {
    return { id, color: null, image: null, swatch: preset.swatch };
  }
  return {
    id,
    color: preset.color,
    image: photo ?? preset.image,
    swatch: preset.swatch,
  };
}

export function applyBoardBackground(resolved: ResolvedBackground) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved.color == null) root.style.removeProperty("--board-bg-color");
  else root.style.setProperty("--board-bg-color", resolved.color);
  if (resolved.image == null) root.style.removeProperty("--board-bg-image");
  else root.style.setProperty("--board-bg-image", resolved.image);
  if (resolved.color == null && resolved.image == null) delete root.dataset.background;
  else root.dataset.background = resolved.id;

  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute("content", resolved.color ?? PRESETS.default.color);
}
