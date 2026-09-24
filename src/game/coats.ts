export type CoatMotion = "still" | "pulse" | "fade" | "rainbow";

export type Coat = {
  id: string;
  name: string;
  motion: CoatMotion;
  hue: number;
  price: number;
  detail: string;
};

export const DEFAULT_COAT = "blue";

export const COATS: Coat[] = [
  { id: "blue", name: "Still Blue", motion: "still", hue: 227, price: 0, detail: "The house lacquer" },
  { id: "blue-pulse", name: "Pulse Blue", motion: "pulse", hue: 227, price: 12, detail: "Blue that throbs" },
  { id: "blue-fade", name: "Fade Blue", motion: "fade", hue: 227, price: 18, detail: "Shifts through blues" },
  { id: "red", name: "Still Red", motion: "still", hue: 4, price: 6, detail: "One solid red coat" },
  { id: "red-pulse", name: "Pulse Red", motion: "pulse", hue: 4, price: 12, detail: "Red that throbs" },
  { id: "red-fade", name: "Fade Red", motion: "fade", hue: 4, price: 18, detail: "Shifts through reds" },
  { id: "green", name: "Still Green", motion: "still", hue: 142, price: 6, detail: "One solid green coat" },
  { id: "green-pulse", name: "Pulse Green", motion: "pulse", hue: 142, price: 12, detail: "Green that throbs" },
  { id: "green-fade", name: "Fade Green", motion: "fade", hue: 142, price: 18, detail: "Shifts through greens" },
  { id: "rainbow", name: "Rainbow", motion: "rainbow", hue: 0, price: 30, detail: "Fades across the spectrum" },
];

const reducedMotion =
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const FADE_SHADES = [
  { s: 0.84, l: 0.3 },
  { s: 0.92, l: 0.46 },
  { s: 0.68, l: 0.58 },
  { s: 0.8, l: 0.38 },
];

export function coatById(id: string): Coat {
  return COATS.find((coat) => coat.id === id) ?? COATS[0]!;
}

export type Hsl = { h: number; s: number; l: number };

export function coatHsl(coat: Coat, time: number): Hsl {
  if (coat.motion === "rainbow") {
    return { h: reducedMotion ? 227 : (time * 36) % 360, s: 0.78, l: 0.5 };
  }
  if (reducedMotion || coat.motion === "still") {
    return { h: coat.hue, s: 0.78, l: 0.48 };
  }
  if (coat.motion === "pulse") {
    const w = 0.5 + 0.5 * Math.sin(time * Math.PI * 2 * 1.15);
    return { h: coat.hue, s: 0.7 + 0.18 * w, l: 0.3 + 0.32 * w };
  }
  const span = 5.5;
  const p = ((time % span) / span) * FADE_SHADES.length;
  const i = Math.floor(p) % FADE_SHADES.length;
  const j = (i + 1) % FADE_SHADES.length;
  const f = p - Math.floor(p);
  const u = f * f * (3 - 2 * f);
  const a = FADE_SHADES[i]!;
  const b = FADE_SHADES[j]!;
  return {
    h: coat.hue + Math.sin(time * 0.65) * 6,
    s: a.s + (b.s - a.s) * u,
    l: a.l + (b.l - a.l) * u,
  };
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) {
    r = c;
    g = x;
  } else if (hp < 2) {
    r = x;
    g = c;
  } else if (hp < 3) {
    g = c;
    b = x;
  } else if (hp < 4) {
    g = x;
    b = c;
  } else if (hp < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const m = l - c / 2;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

export function rgbCss(c: [number, number, number]): string {
  return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
}

export function coatFillCss(id: string, time: number): string {
  const hsl = coatHsl(coatById(id), time);
  return rgbCss(hslToRgb(hsl.h, hsl.s, hsl.l));
}

export function coatSwatch(coat: Coat): string {
  if (coat.motion === "rainbow") return "";
  const hsl = coat.motion === "pulse" || coat.motion === "fade" ? { h: coat.hue, s: 0.78, l: 0.48 } : coatHsl(coat, 0);
  return rgbCss(hslToRgb(hsl.h, hsl.s, hsl.l));
}
