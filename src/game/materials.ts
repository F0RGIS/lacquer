export type Rgb = readonly [number, number, number];

export type BoardMaterial = {
  id: string;
  name: string;
  kind: "grain" | "vein" | "speckle" | "brushed" | "bamboo" | "slate" | "glass" | "plywood" | "flake" | "flat" | "polished";
  dark: Rgb;
  light: Rgb;
  accent: Rgb;
  scale: number;
  cavity: string;
  lip: string;
  dust: string;
  vignette: string;
  sheen: string;
  swatch: string;
};

export const MATERIALS: BoardMaterial[] = [
  {
    id: "walnut",
    name: "Walnut",
    kind: "grain",
    dark: [58, 32, 16],
    light: [142, 86, 46],
    accent: [36, 18, 10],
    scale: 1.1,
    cavity: "#1a100c",
    lip: "rgba(196,140,80,0.24)",
    dust: "90,62,36",
    vignette: "rgba(32,16,8,0.34)",
    sheen: "rgba(255,220,180,0.18)",
    swatch: "#8d5a32",
  },
  {
    id: "maple",
    name: "Maple",
    kind: "grain",
    dark: [176, 142, 96],
    light: [244, 226, 190],
    accent: [150, 110, 70],
    scale: 3.6,
    cavity: "#2a1c12",
    lip: "rgba(255,230,190,0.35)",
    dust: "120,96,64",
    vignette: "rgba(60,40,20,0.26)",
    sheen: "rgba(255,244,220,0.28)",
    swatch: "#e6d2ae",
  },
  {
    id: "cherry",
    name: "Cherry",
    kind: "grain",
    dark: [112, 36, 32],
    light: [200, 88, 68],
    accent: [80, 22, 24],
    scale: 2,
    cavity: "#1c0c0c",
    lip: "rgba(230,140,120,0.26)",
    dust: "120,54,42",
    vignette: "rgba(48,12,10,0.34)",
    sheen: "rgba(255,200,180,0.18)",
    swatch: "#b55244",
  },
  {
    id: "bamboo",
    name: "Bamboo",
    kind: "bamboo",
    dark: [150, 128, 62],
    light: [236, 216, 132],
    accent: [92, 68, 28],
    scale: 1,
    cavity: "#241c0c",
    lip: "rgba(240,220,140,0.28)",
    dust: "110,90,40",
    vignette: "rgba(40,32,8,0.3)",
    sheen: "rgba(255,244,190,0.22)",
    swatch: "#d8c46e",
  },
  {
    id: "slate",
    name: "Slate",
    kind: "slate",
    dark: [42, 50, 58],
    light: [136, 150, 160],
    accent: [24, 28, 32],
    scale: 1,
    cavity: "#12161a",
    lip: "rgba(180,196,206,0.26)",
    dust: "70,78,86",
    vignette: "rgba(10,14,18,0.38)",
    sheen: "rgba(220,230,236,0.16)",
    swatch: "#6e7c86",
  },
  {
    id: "carrara",
    name: "Carrara",
    kind: "vein",
    dark: [168, 166, 162],
    light: [248, 246, 242],
    accent: [86, 94, 108],
    scale: 1,
    cavity: "#1a1c20",
    lip: "rgba(255,255,255,0.42)",
    dust: "140,138,134",
    vignette: "rgba(20,20,24,0.24)",
    sheen: "rgba(255,255,255,0.35)",
    swatch: "#eceae6",
  },
  {
    id: "granite",
    name: "Granite",
    kind: "speckle",
    dark: [62, 60, 64],
    light: [176, 172, 168],
    accent: [176, 108, 104],
    scale: 2,
    cavity: "#121214",
    lip: "rgba(200,196,192,0.22)",
    dust: "80,78,82",
    vignette: "rgba(12,12,14,0.36)",
    sheen: "rgba(230,228,226,0.14)",
    swatch: "#8c888c",
  },
  {
    id: "copper",
    name: "Copper",
    kind: "brushed",
    dark: [122, 52, 28],
    light: [230, 136, 76],
    accent: [42, 112, 90],
    scale: 1,
    cavity: "#1a0e0a",
    lip: "rgba(255,180,120,0.3)",
    dust: "130,70,40",
    vignette: "rgba(40,14,8,0.34)",
    sheen: "rgba(255,210,160,0.28)",
    swatch: "#d07a42",
  },
  {
    id: "jade",
    name: "Jade",
    kind: "vein",
    dark: [22, 88, 64],
    light: [136, 208, 158],
    accent: [232, 244, 226],
    scale: 2.2,
    cavity: "#06140e",
    lip: "rgba(190,240,210,0.28)",
    dust: "40,90,70",
    vignette: "rgba(4,24,16,0.36)",
    sheen: "rgba(220,255,236,0.18)",
    swatch: "#3eae80",
  },
  {
    id: "sandstone",
    name: "Sandstone",
    kind: "speckle",
    dark: [156, 118, 74],
    light: [232, 198, 148],
    accent: [120, 78, 46],
    scale: 0.45,
    cavity: "#24180e",
    lip: "rgba(240,210,170,0.28)",
    dust: "140,110,70",
    vignette: "rgba(48,30,12,0.3)",
    sheen: "rgba(255,230,200,0.18)",
    swatch: "#d8b48a",
  },
  {
    id: "ebony",
    name: "Ebony",
    kind: "grain",
    dark: [14, 12, 11],
    light: [78, 62, 48],
    accent: [28, 22, 18],
    scale: 4.2,
    cavity: "#050403",
    lip: "rgba(160,130,100,0.2)",
    dust: "40,32,24",
    vignette: "rgba(0,0,0,0.42)",
    sheen: "rgba(200,170,140,0.1)",
    swatch: "#3a3028",
  },
  {
    id: "terracotta",
    name: "Terracotta",
    kind: "speckle",
    dark: [148, 64, 38],
    light: [216, 114, 72],
    accent: [96, 36, 24],
    scale: 0.35,
    cavity: "#1c0c08",
    lip: "rgba(240,160,120,0.24)",
    dust: "140,70,44",
    vignette: "rgba(48,16,8,0.32)",
    sheen: "rgba(255,200,170,0.16)",
    swatch: "#c45a38",
  },
];

export function dealMaterials(count: number): BoardMaterial[] {
  const pool = MATERIALS.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = swap;
  }
  const dealt: BoardMaterial[] = [];
  for (let i = 0; i < count; i++) dealt.push(pool[i % pool.length]!);
  return dealt;
}

export function pickMaterial(exceptId?: string): BoardMaterial {
  const pool = exceptId ? MATERIALS.filter((m) => m.id !== exceptId) : MATERIALS;
  return pool[Math.floor(Math.random() * pool.length)] ?? MATERIALS[0]!;
}

export const DEFAULT_BOARD = "plywood";

export type ShopBoard = { id: string; price: number; detail: string };

function stock(partial: {
  id: string;
  name: string;
  kind: BoardMaterial["kind"];
  dark: Rgb;
  light: Rgb;
  accent: Rgb;
  scale: number;
  swatch: string;
  cavity?: string;
}): BoardMaterial {
  return {
    cavity: partial.cavity ?? "#14110e",
    lip: "rgba(255,255,255,0.24)",
    dust: `${partial.dark[0]},${partial.dark[1]},${partial.dark[2]}`,
    vignette: "rgba(0,0,0,0.32)",
    sheen: "rgba(255,255,255,0.18)",
    ...partial,
  };
}

const EXTRA_BOARDS: BoardMaterial[] = [
  stock({ id: "plywood", name: "Plywood", kind: "plywood", dark: [186, 150, 96], light: [236, 214, 168], accent: [92, 64, 36], scale: 1, swatch: "#e2c99a" }),
  stock({ id: "oak", name: "Oak", kind: "grain", dark: [150, 104, 52], light: [214, 168, 102], accent: [90, 58, 28], scale: 1.6, swatch: "#c49258" }),
  stock({ id: "pine", name: "Pine", kind: "grain", dark: [196, 164, 96], light: [236, 214, 150], accent: [120, 90, 40], scale: 2.4, swatch: "#e6d2a0" }),
  stock({ id: "cedar", name: "Cedar", kind: "grain", dark: [148, 78, 48], light: [196, 112, 72], accent: [90, 42, 28], scale: 2, swatch: "#b46a44" }),
  stock({ id: "fir", name: "Fir", kind: "grain", dark: [176, 140, 78], light: [214, 184, 120], accent: [90, 70, 36], scale: 2.8, swatch: "#d4b878" }),
  stock({ id: "spruce", name: "Spruce", kind: "grain", dark: [186, 170, 130], light: [228, 216, 186], accent: [110, 96, 64], scale: 3.2, swatch: "#ddd2b4" }),
  stock({ id: "mdf", name: "MDF", kind: "flat", dark: [168, 140, 108], light: [198, 174, 144], accent: [140, 112, 84], scale: 2, swatch: "#c4aa88" }),
  stock({ id: "osb", name: "OSB", kind: "flake", dark: [120, 90, 48], light: [196, 160, 90], accent: [70, 48, 24], scale: 1, swatch: "#b89250" }),
  stock({ id: "steel", name: "Steel", kind: "polished", dark: [58, 64, 72], light: [176, 184, 192], accent: [30, 34, 40], scale: 1, swatch: "#8e98a2" }),
  stock({ id: "cast-iron", name: "Cast Iron", kind: "speckle", dark: [28, 28, 30], light: [72, 72, 76], accent: [16, 16, 18], scale: 1.4, swatch: "#3a3a3e", cavity: "#0c0c0e" }),
  stock({ id: "wrought-iron", name: "Wrought Iron", kind: "brushed", dark: [32, 30, 28], light: [78, 72, 66], accent: [18, 16, 14], scale: 1, swatch: "#403c38", cavity: "#0c0c0e" }),
  stock({ id: "aluminum", name: "Aluminum", kind: "polished", dark: [120, 126, 132], light: [214, 220, 226], accent: [80, 84, 90], scale: 1, swatch: "#c5ccd2" }),
  stock({ id: "lead", name: "Lead", kind: "flat", dark: [68, 72, 78], light: [124, 130, 136], accent: [40, 44, 48], scale: 1, swatch: "#6e747c" }),
  stock({ id: "zinc", name: "Zinc", kind: "polished", dark: [96, 104, 108], light: [186, 194, 196], accent: [60, 66, 70], scale: 1, swatch: "#a8b0b2" }),
  stock({ id: "brass", name: "Brass", kind: "polished", dark: [150, 110, 36], light: [232, 196, 92], accent: [90, 64, 20], scale: 1, swatch: "#d4b45a" }),
  stock({ id: "bronze", name: "Bronze", kind: "polished", dark: [112, 64, 32], light: [186, 116, 62], accent: [70, 36, 18], scale: 1, swatch: "#a86c3c" }),
  stock({ id: "stainless", name: "Stainless Steel", kind: "polished", dark: [90, 98, 106], light: [220, 226, 232], accent: [50, 56, 64], scale: 1, swatch: "#c5ced6" }),
  stock({ id: "gold", name: "Gold", kind: "polished", dark: [146, 98, 28], light: [236, 198, 86], accent: [90, 60, 16], scale: 1, swatch: "#e2c15a" }),
  stock({ id: "silver", name: "Silver", kind: "polished", dark: [140, 146, 154], light: [236, 240, 244], accent: [80, 84, 92], scale: 1, swatch: "#d8dee6" }),
  stock({ id: "platinum", name: "Platinum", kind: "polished", dark: [160, 166, 172], light: [244, 244, 246], accent: [100, 104, 112], scale: 1, swatch: "#e4e6ea" }),
  stock({ id: "quartzite", name: "Quartzite", kind: "vein", dark: [150, 144, 136], light: [232, 226, 216], accent: [90, 86, 80], scale: 1.4, swatch: "#ddd6cc" }),
  stock({ id: "marble-stone", name: "Marble", kind: "vein", dark: [176, 176, 176], light: [248, 248, 248], accent: [70, 78, 92], scale: 1.2, swatch: "#f2f2f2" }),
  stock({ id: "soapstone", name: "Soapstone", kind: "speckle", dark: [42, 48, 50], light: [96, 106, 108], accent: [24, 28, 30], scale: 0.6, swatch: "#4e585a", cavity: "#101214" }),
  stock({ id: "quartz", name: "Quartz", kind: "vein", dark: [210, 206, 198], light: [248, 246, 242], accent: [160, 170, 180], scale: 0.8, swatch: "#f4f1ea" }),
  stock({ id: "porcelain", name: "Porcelain", kind: "flat", dark: [214, 216, 218], light: [246, 246, 246], accent: [180, 184, 188], scale: 1, swatch: "#f3f4f5" }),
];

for (const board of EXTRA_BOARDS) {
  if (!MATERIALS.some((item) => item.id === board.id)) MATERIALS.push(board);
}

export const SHOP_BOARDS: ShopBoard[] = [
  { id: "plywood", price: 0, detail: "Layered birch. The starting board" },
  { id: "pine", price: 4, detail: "Pale softwood grain" },
  { id: "fir", price: 4, detail: "Warm straight grain" },
  { id: "spruce", price: 4, detail: "Cool pale timber" },
  { id: "mdf", price: 4, detail: "Even pressed fiber" },
  { id: "osb", price: 5, detail: "Pressed wood flakes" },
  { id: "cedar", price: 6, detail: "Red aromatic grain" },
  { id: "oak", price: 8, detail: "Classic open grain" },
  { id: "maple", price: 8, detail: "Tight pale grain" },
  { id: "cherry", price: 10, detail: "Red furniture wood" },
  { id: "walnut", price: 12, detail: "Dark chocolate grain" },
  { id: "cast-iron", price: 6, detail: "Speckled dark metal" },
  { id: "wrought-iron", price: 8, detail: "Hammered black metal" },
  { id: "steel", price: 8, detail: "Polished shop steel" },
  { id: "lead", price: 8, detail: "Dull heavy gray" },
  { id: "zinc", price: 8, detail: "Cool pale metal" },
  { id: "aluminum", price: 10, detail: "Bright milled metal" },
  { id: "copper", price: 12, detail: "Warm polished copper" },
  { id: "brass", price: 12, detail: "Yellow alloy" },
  { id: "bronze", price: 12, detail: "Aged copper alloy" },
  { id: "stainless", price: 14, detail: "Mirror steel" },
  { id: "silver", price: 18, detail: "Bright silver" },
  { id: "gold", price: 24, detail: "Polished gold" },
  { id: "platinum", price: 30, detail: "White precious metal" },
  { id: "soapstone", price: 8, detail: "Soft dark stone" },
  { id: "granite", price: 10, detail: "Speckled igneous stone" },
  { id: "porcelain", price: 10, detail: "Fired white clay" },
  { id: "quartz", price: 12, detail: "Milky crystal" },
  { id: "quartzite", price: 14, detail: "Hard pale stone" },
  { id: "marble-stone", price: 16, detail: "White veined stone" },
];

export function materialById(id: string): BoardMaterial {
  return MATERIALS.find((item) => item.id === id) ?? MATERIALS.find((item) => item.id === DEFAULT_BOARD)!;
}

function hash(ix: number, iy: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function shade(material: BoardMaterial, nx: number, ny: number): { v: number; accent: number } {
  const s = material.scale;
  if (material.kind === "grain") {
    const warp = Math.sin(ny * (8 + s) + Math.sin(nx * 5.4) * 1.25);
    const rings = Math.sin((nx * (1.35 + s * 0.12) + warp * 0.35) * (24 + s * 9) + ny * 2.2);
    const fine = Math.sin(nx * (150 + s * 36) + ny * 14 + warp);
    let v = 0.48 + rings * 0.22 + fine * 0.05 + warp * 0.04;
    const k1 = Math.hypot((nx - 0.78) * 1.4, ny - 0.22);
    if (k1 < 0.07) v -= (0.07 - k1) * 1.7;
    const k2 = Math.hypot((nx - 0.18) * 1.1, ny - 0.72);
    if (k2 < 0.045) v -= (0.045 - k2) * 1.3;
    return { v, accent: 0 };
  }
  if (material.kind === "vein") {
    const n = noise(nx * (3 + s), ny * (3 + s));
    const n2 = noise(nx * 7 + 4.2, ny * 5 + 1.3);
    const wave = Math.abs(Math.sin(nx * (5 + s) + n * 7.5 + ny * 1.6));
    const wave2 = Math.abs(Math.sin(ny * (8 + s * 0.5) + n2 * 6.2 + nx * 2));
    let v = 0.64 + n * 0.2 + n2 * 0.08;
    let accent = 0;
    if (wave < 0.16) {
      accent = (0.16 - wave) / 0.16;
      v -= accent * 0.28;
    }
    if (wave2 < 0.07) accent = Math.max(accent, ((0.07 - wave2) / 0.07) * 0.65);
    return { v, accent };
  }
  if (material.kind === "speckle") {
    const cells = 64 + s * 36;
    const h = hash(Math.floor(nx * cells), Math.floor(ny * cells));
    const n = noise(nx * (4 + s), ny * (4 + s));
    let v = 0.42 + n * 0.28 + (h - 0.5) * 0.16;
    let accent = 0;
    if (h > 0.94) v = 0.92;
    else if (h < 0.06) v = 0.1;
    else if (h > 0.8) accent = (h - 0.8) / 0.2;
    return { v, accent };
  }
  if (material.kind === "brushed") {
    const streak = Math.sin(nx * 520) * 0.035 + Math.sin(nx * 140 + ny * 3) * 0.07;
    const band = Math.sin((ny + nx * 0.08) * Math.PI * 1.4);
    const patina = noise(nx * 6.5, ny * 6.5);
    const accent = patina > 0.72 ? (patina - 0.72) * 1.5 : 0;
    return { v: 0.5 + streak + band * 0.16, accent };
  }
  if (material.kind === "bamboo") {
    const phase = (ny * 6.5) % 1;
    const node = phase < 0.045 || phase > 0.975;
    const fiber = Math.sin(nx * 240 + ny * 8) * 0.06 + Math.sin(nx * 58) * 0.04;
    const n = noise(nx * 3, ny * 11);
    let v = 0.62 + fiber + n * 0.12;
    if (node) v -= 0.3;
    return { v, accent: node ? 0.55 : 0 };
  }
  if (material.kind === "slate") {
    const warp = Math.sin(nx * 3.2) * 0.04;
    const layer = Math.sin((ny + warp) * 52);
    const crack = Math.abs(Math.sin(nx * 18 + ny * 2.4 + noise(nx * 4, ny * 4) * 3));
    let v = 0.46 + layer * 0.16 + noise(nx * 8, ny * 3) * 0.12;
    let accent = 0;
    if (crack < 0.08) {
      v -= 0.22;
      accent = 0.45;
    }
    return { v, accent };
  }
  if (material.kind === "plywood") {
    const glue = Math.abs(((ny * 16) % 1) - 0.5);
    const ply = Math.sin(nx * (70 + s * 30) + ny * 3);
    let v = 0.66 + ply * 0.08 + noise(nx * 6, ny * 2) * 0.05;
    let accent = 0;
    if (glue < 0.04) {
      v -= 0.32;
      accent = 0.6;
    }
    return { v, accent };
  }
  if (material.kind === "flake") {
    const cols = 18;
    const rows = 12;
    const fx = Math.floor(nx * cols);
    const fy = Math.floor(ny * rows);
    const h = hash(fx, fy);
    const ang = h * Math.PI;
    const lx = nx * cols - fx - 0.5;
    const ly = ny * rows - fy - 0.5;
    const along = Math.abs(lx * Math.cos(ang) + ly * Math.sin(ang));
    let v = 0.32 + h * 0.5;
    if (along > 0.4) v *= 0.72;
    return { v, accent: h > 0.78 ? 0.4 : 0 };
  }
  if (material.kind === "flat") {
    const n = noise(nx * (10 + s * 4), ny * (10 + s * 4));
    return { v: 0.6 + (n - 0.5) * 0.1, accent: 0 };
  }
  if (material.kind === "polished") {
    const streak = Math.sin(nx * 680 + ny * 6) * 0.02;
    const band = Math.exp(-(((nx - 0.33) * 4.4) ** 2)) * 0.4;
    const fall = Math.sin(ny * Math.PI) * 0.05;
    return { v: 0.4 + streak + band + fall, accent: 0 };
  }
  const n = noise(nx * 3, ny * 3);
  const sheen = Math.pow(Math.max(0, Math.sin((nx * 0.85 + ny) * 3.1 + n)), 6);
  return { v: 0.16 + n * 0.14 + sheen * 0.72, accent: sheen * 0.4 };
}

const textureCache = new Map<string, HTMLCanvasElement>();
const TEX = 512;

export function materialTexture(material: BoardMaterial): HTMLCanvasElement {
  const hit = textureCache.get(material.id);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = TEX;
  canvas.height = TEX;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(TEX, TEX);
  const data = img.data;
  const { dark, light, accent } = material;
  for (let y = 0; y < TEX; y++) {
    const ny = y / TEX;
    for (let x = 0; x < TEX; x++) {
      const nx = x / TEX;
      const sample = shade(material, nx, ny);
      let v = sample.v;
      const edge = Math.min(nx, ny, 1 - nx, 1 - ny);
      if (edge < 0.055) v -= (0.055 - edge) * 2;
      v = clamp01(v);
      const a = clamp01(sample.accent);
      const baseR = dark[0] + (light[0] - dark[0]) * v;
      const baseG = dark[1] + (light[1] - dark[1]) * v;
      const baseB = dark[2] + (light[2] - dark[2]) * v;
      const i = (y * TEX + x) * 4;
      data[i] = baseR + (accent[0] - baseR) * a;
      data[i + 1] = baseG + (accent[1] - baseG) * a;
      data[i + 2] = baseB + (accent[2] - baseB) * a;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  textureCache.set(material.id, canvas);
  return canvas;
}
