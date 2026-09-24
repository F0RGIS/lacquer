export type Frame = {
  id: string;
  name: string;
  price: number;
  detail: string;
  swatch: string;
  background: string;
};

export const DEFAULT_FRAME = "cotton";

export const FRAMES: Frame[] = [
  {
    id: "cotton",
    name: "Cotton",
    price: 0,
    detail: "White cotton. The starting border",
    swatch: "#f7f4ee",
    background:
      "repeating-linear-gradient(0deg, #f7f4ee 0 2px, #efeae2 2px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 4px)",
  },
  {
    id: "linen",
    name: "Linen",
    price: 90,
    detail: "Slubby natural weave",
    swatch: "#e4d3b4",
    background:
      "repeating-linear-gradient(90deg, #e7d6b6 0 3px, #d8c4a0 3px 4px), repeating-linear-gradient(0deg, rgba(90,60,20,0.15) 0 1px, transparent 1px 5px)",
  },
  {
    id: "silk",
    name: "Silk",
    price: 300,
    detail: "Smooth sheen",
    swatch: "#f0d7c4",
    background: "linear-gradient(115deg, #f8e6d4 0%, #e7b89a 42%, #fff6ee 58%, #e8c2a8 100%)",
  },
  {
    id: "wool",
    name: "Wool",
    price: 180,
    detail: "Heathered knit",
    swatch: "#b7a898",
    background:
      "repeating-linear-gradient(45deg, #c4b4a4 0 2px, #a89888 2px 4px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 3px)",
  },
  {
    id: "polyester",
    name: "Polyester",
    price: 60,
    detail: "Even synthetic plain",
    swatch: "#d5d8de",
    background: "repeating-linear-gradient(0deg, #e4e7ee 0 2px, #c8ced8 2px 3px)",
  },
  {
    id: "nylon",
    name: "Nylon",
    price: 60,
    detail: "Tight slick weave",
    swatch: "#c9d0d6",
    background: "linear-gradient(180deg, #eef3f6, #b7c2cc)",
  },
  {
    id: "spandex",
    name: "Spandex",
    price: 120,
    detail: "Stretch knit",
    swatch: "#2c3444",
    background:
      "repeating-linear-gradient(90deg, #2a3142 0 3px, #3c465c 3px 6px)",
  },
  {
    id: "rayon",
    name: "Rayon / Viscose",
    price: 105,
    detail: "Soft viscose drape",
    swatch: "#d7c6b4",
    background: "linear-gradient(160deg, #f0e2d2, #cbb59d 55%, #e6d5c4)",
  },
  {
    id: "modal",
    name: "Modal",
    price: 120,
    detail: "Fine matte knit",
    swatch: "#c9bfc2",
    background: "repeating-linear-gradient(0deg, #ddd4d6 0 2px, #c9bfc2 2px 4px)",
  },
  {
    id: "denim",
    name: "Denim",
    price: 150,
    detail: "Twill cotton",
    swatch: "#3d5f86",
    background:
      "repeating-linear-gradient(45deg, #35567c 0 3px, #4a719c 3px 6px)",
  },
  {
    id: "jersey",
    name: "Jersey",
    price: 75,
    detail: "Loop-knit tee cloth",
    swatch: "#efe8df",
    background:
      "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.08) 1px, transparent 1.5px) 0 0 / 6px 6px, #f3ece4",
  },
  {
    id: "velvet",
    name: "Velvet",
    price: 240,
    detail: "Piled sheen",
    swatch: "#6b2438",
    background: "linear-gradient(180deg, #8a3048 0%, #4a1524 55%, #7a2840 100%)",
  },
];

export function frameById(id: string): Frame {
  return FRAMES.find((frame) => frame.id === id) ?? FRAMES[0]!;
}
