export const FONT_IDS = [
  "default",
  "be-vietnam-pro",
  "inter",
  "nunito",
  "source-sans-3",
  "ibm-plex-sans",
  "manrope",
  "literata",
  "newsreader",
  "fraunces",
  "playfair-display",
  "lora",
  "system",
  "custom",
] as const;

export type FontId = (typeof FONT_IDS)[number];

export const DEFAULT_FONT_ID: FontId = "default";

const DEFAULT_SANS = '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif';
const DEFAULT_DISPLAY = '"Literata Variable", ui-serif, Georgia, serif';
const SYSTEM_SANS = "ui-sans-serif, system-ui, sans-serif";
const SYSTEM_SERIF = 'ui-serif, Georgia, "Times New Roman", serif';

const PRESET_LABELS: Record<Exclude<FontId, "default" | "system" | "custom">, string> = {
  "be-vietnam-pro": "Be Vietnam Pro",
  inter: "Inter",
  nunito: "Nunito",
  "source-sans-3": "Source Sans 3",
  "ibm-plex-sans": "IBM Plex Sans",
  manrope: "Manrope",
  literata: "Literata",
  newsreader: "Newsreader",
  fraunces: "Fraunces",
  "playfair-display": "Playfair Display",
  lora: "Lora",
};

type PresetKind = "sans" | "serif";

const PRESETS: Record<
  Exclude<FontId, "default" | "system" | "custom">,
  { family: string; kind: PresetKind; google: boolean }
> = {
  "be-vietnam-pro": { family: "Be Vietnam Pro", kind: "sans", google: false },
  inter: { family: "Inter", kind: "sans", google: true },
  nunito: { family: "Nunito", kind: "sans", google: true },
  "source-sans-3": { family: "Source Sans 3", kind: "sans", google: true },
  "ibm-plex-sans": { family: "IBM Plex Sans", kind: "sans", google: true },
  manrope: { family: "Manrope", kind: "sans", google: true },
  literata: { family: "Literata Variable", kind: "serif", google: false },
  newsreader: { family: "Newsreader", kind: "serif", google: true },
  fraunces: { family: "Fraunces", kind: "serif", google: true },
  "playfair-display": { family: "Playfair Display", kind: "serif", google: true },
  lora: { family: "Lora", kind: "serif", google: true },
};

const FONT_ID_SET = new Set<string>(FONT_IDS);

const STYLESHEET_ID = "eve-board-fonts";
const PRECONNECT_ID = "eve-board-fonts-preconnect";
const GSTATIC_ID = "eve-board-fonts-gstatic";

export type ResolvedFont = {
  id: FontId;
  sans: string;
  display: string;
  googleFamilies: string[];
};

export function parseFontId(value: unknown): FontId {
  if (typeof value === "string" && FONT_ID_SET.has(value)) return value as FontId;
  return DEFAULT_FONT_ID;
}

/** Google Font family names: letters, numbers, spaces, hyphens. */
export function isSafeCustomFontName(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9 -]{0,62}$/.test(value);
}

export function parseFontCustom(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.slice(0, 64);
}

function stack(family: string, kind: PresetKind): string {
  const quoted = `"${family}"`;
  return kind === "sans" ? `${quoted}, ${SYSTEM_SANS}` : `${quoted}, ${SYSTEM_SERIF}`;
}

export function resolveFont(fontId: unknown, fontCustom: unknown = ""): ResolvedFont {
  const id = parseFontId(fontId);
  if (id === "default") {
    return { id, sans: DEFAULT_SANS, display: DEFAULT_DISPLAY, googleFamilies: [] };
  }
  if (id === "system") {
    return { id, sans: SYSTEM_SANS, display: SYSTEM_SERIF, googleFamilies: [] };
  }
  if (id === "custom") {
    const name = parseFontCustom(fontCustom).trim();
    if (!isSafeCustomFontName(name)) {
      return { id, sans: DEFAULT_SANS, display: DEFAULT_DISPLAY, googleFamilies: [] };
    }
    const css = stack(name, "sans");
    return { id, sans: css, display: css, googleFamilies: [name] };
  }
  const preset = PRESETS[id];
  const css = stack(preset.family, preset.kind);
  return {
    id,
    sans: css,
    display: css,
    googleFamilies: preset.google ? [preset.family] : [],
  };
}

export function fontOptionLabel(
  id: FontId,
  copy: { fontDefault: string; fontSystem: string; fontCustom: string },
): string {
  if (id === "default") return copy.fontDefault;
  if (id === "system") return copy.fontSystem;
  if (id === "custom") return copy.fontCustom;
  return PRESET_LABELS[id];
}

export function googleFontsHref(families: string[]): string | null {
  const unique = [...new Set(families.map((f) => f.trim()).filter(isSafeCustomFontName))];
  if (unique.length === 0) return null;
  const params = unique
    .map((family) => `family=${family.replace(/ /g, "+")}:wght@400;500;600`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

function upsertLink(id: string, attrs: Record<string, string>) {
  let el = document.getElementById(id) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.id = id;
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

function removeEl(id: string) {
  document.getElementById(id)?.remove();
}

export function applyBoardFonts(resolved: ResolvedFont) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved.id === "default") {
    root.style.removeProperty("--font-sans");
    root.style.removeProperty("--font-display");
  } else {
    root.style.setProperty("--font-sans", resolved.sans);
    root.style.setProperty("--font-display", resolved.display);
  }
  root.dataset.font = resolved.id;

  const href = googleFontsHref(resolved.googleFamilies);
  if (!href) {
    removeEl(STYLESHEET_ID);
    removeEl(PRECONNECT_ID);
    removeEl(GSTATIC_ID);
    return;
  }
  upsertLink(PRECONNECT_ID, { rel: "preconnect", href: "https://fonts.googleapis.com" });
  upsertLink(GSTATIC_ID, {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossorigin: "",
  });
  upsertLink(STYLESHEET_ID, { rel: "stylesheet", href });
}
