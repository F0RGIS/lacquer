import type { Dir, Grid } from "@/game/logic";
import { coatById, coatHsl, hslToRgb, rgbCss } from "@/game/coats";
import { drawToken, pieceById } from "@/game/pieces";
import { materialTexture, type BoardMaterial } from "@/game/materials";

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  radius: number;
  kind: "paint" | "dust" | "win";
};

export type DrawState = {
  grid: Grid;
  painted: Uint8Array;
  wet: Float32Array;
  ballX: number;
  ballY: number;
  ballRot: number;
  squashX: number;
  squashY: number;
  particles: Particle[];
  trauma: number;
  hint: Dir | null;
  hintLife: number;
  material: BoardMaterial;
  coatId: string;
  pieceId: string;
  stride: number;
};

type Layout = { ox: number; oy: number; cell: number; size: number };

function rgbaCss(c: [number, number, number], a: number): string {
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
}

function layoutOf(grid: Grid, size: number): Layout {
  const margin = size * 0.035;
  const cell = Math.max(8, Math.floor((size - margin * 2) / Math.max(grid.cols, grid.rows)));
  const gw = cell * grid.cols;
  const gh = cell * grid.rows;
  return {
    ox: Math.floor((size - gw) / 2),
    oy: Math.floor((size - gh) / 2),
    cell,
    size,
  };
}

function shadeEdge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  side: "n" | "s" | "e" | "w",
  color: string,
): void {
  const d = Math.max(3, s * 0.2);
  let x0 = x;
  let y0 = y;
  let x1 = x;
  let y1 = y;
  if (side === "n") y1 = y + d;
  else if (side === "s") {
    y0 = y + s;
    y1 = y + s - d;
  } else if (side === "w") x1 = x + d;
  else {
    x0 = x + s;
    x1 = x + s - d;
  }
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, s, s);
}

export function drawBoard(ctx: CanvasRenderingContext2D, state: DrawState, size: number, time: number): void {
  const { grid, material } = state;
  const texture = materialTexture(material);

  const shake = state.trauma * state.trauma;
  const jx = Math.sin(time * 41) * shake * size * 0.01;
  const jy = Math.cos(time * 33) * shake * size * 0.01;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(texture, 0, 0, size, size);

  const vignette = ctx.createRadialGradient(size / 2, size * 0.45, size * 0.2, size / 2, size / 2, size * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, material.vignette);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = material.sheen;
  ctx.fillRect(0, 0, size, Math.max(2, size * 0.008));
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, size - Math.max(3, size * 0.012), size, Math.max(3, size * 0.012));

  ctx.save();
  ctx.translate(jx, jy);
  const lay = layoutOf(grid, size);
  const { ox, oy, cell } = lay;
  const hsl = coatHsl(coatById(state.coatId), time);
  const coat = hslToRgb(hsl.h, hsl.s, hsl.l);
  const coatDeep = hslToRgb(hsl.h, Math.min(1, hsl.s + 0.05), hsl.l * 0.38);
  const coatLip = hslToRgb(hsl.h, hsl.s * 0.4, Math.min(0.92, hsl.l + 0.34));
  const coatFill = rgbCss(coat);

  for (let i = 0; i < grid.open.length; i++) {
    const cellPos = grid.open[i]!;
    const x = ox + cellPos.c * cell;
    const y = oy + cellPos.r * cell;
    ctx.fillStyle = state.painted[i] ? coatFill : material.cavity;
    ctx.fillRect(x, y, cell, cell);
    if (state.wet[i]! > 0.01) {
      ctx.fillStyle = `rgba(255,255,255,${state.wet[i]! * 0.4})`;
      ctx.fillRect(x, y, cell, cell);
    }
  }

  for (let i = 0; i < grid.open.length; i++) {
    const cellPos = grid.open[i]!;
    const x = ox + cellPos.c * cell;
    const y = oy + cellPos.r * cell;
    const { r, c } = cellPos;
    const up = r > 0 ? grid.id[(r - 1) * grid.cols + c]! : -1;
    const down = r + 1 < grid.rows ? grid.id[(r + 1) * grid.cols + c]! : -1;
    const left = c > 0 ? grid.id[r * grid.cols + (c - 1)]! : -1;
    const right = c + 1 < grid.cols ? grid.id[r * grid.cols + c + 1]! : -1;
    const ink = state.painted[i] ? rgbaCss(coatDeep, 0.55) : "rgba(0,0,0,0.45)";
    const lip = state.painted[i] ? rgbaCss(coatLip, 0.34) : material.lip;
    if (up < 0) shadeEdge(ctx, x, y, cell, "n", ink);
    if (left < 0) shadeEdge(ctx, x, y, cell, "w", ink);
    if (down < 0) shadeEdge(ctx, x, y, cell, "s", lip);
    if (right < 0) shadeEdge(ctx, x, y, cell, "e", lip);
  }

  ctx.save();
  ctx.beginPath();
  let anyPaint = false;
  for (let i = 0; i < grid.open.length; i++) {
    if (!state.painted[i]) continue;
    anyPaint = true;
    const cellPos = grid.open[i]!;
    ctx.rect(ox + cellPos.c * cell, oy + cellPos.r * cell, cell, cell);
  }
  if (anyPaint) {
    ctx.clip();
    const sheen = ctx.createLinearGradient(0, oy, 0, oy + grid.rows * cell);
    sheen.addColorStop(0, "rgba(255,255,255,0.2)");
    sheen.addColorStop(0.42, "rgba(255,255,255,0.03)");
    sheen.addColorStop(1, rgbaCss(coatDeep, 0.22));
    ctx.fillStyle = sheen;
    ctx.fillRect(ox, oy, grid.cols * cell, grid.rows * cell);
  }
  ctx.restore();

  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / p.max);
    const px = ox + p.x * cell;
    const py = oy + p.y * cell;
    ctx.beginPath();
    ctx.arc(px, py, p.radius * cell, 0, Math.PI * 2);
    if (p.kind === "dust") ctx.fillStyle = `rgba(${material.dust},${alpha * 0.8})`;
    else if (p.kind === "win") ctx.fillStyle = `rgba(247,243,236,${alpha})`;
    else ctx.fillStyle = rgbaCss(coat, alpha);
    ctx.fill();
  }

  const radius = cell * 0.36;
  const bx = ox + state.ballX * cell;
  const by = oy + state.ballY * cell;
  const piece = pieceById(state.pieceId);
  if (piece.kind === "marble") {
    ctx.save();
    ctx.translate(bx + radius * 0.08, by + radius * 0.72);
    ctx.scale(1, 0.36);
    ctx.fillStyle = "rgba(20,10,4,0.42)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(state.squashX, state.squashY);
    const hi = hslToRgb(hsl.h, hsl.s * 0.22, 0.96);
    const soft = hslToRgb(hsl.h, hsl.s * 0.5, Math.min(0.84, hsl.l + 0.28));
    const body = hslToRgb(hsl.h, hsl.s, hsl.l);
    const deep = hslToRgb(hsl.h, Math.min(1, hsl.s + 0.04), hsl.l * 0.52);
    const edge = hslToRgb(hsl.h, hsl.s * 0.75, hsl.l * 0.26);
    const g = ctx.createRadialGradient(-radius * 0.34, -radius * 0.4, radius * 0.08, 0, 0, radius);
    g.addColorStop(0, rgbCss(hi));
    g.addColorStop(0.16, rgbCss(soft));
    g.addColorStop(0.46, rgbCss(body));
    g.addColorStop(0.78, rgbCss(deep));
    g.addColorStop(1, rgbCss(edge));
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.save();
    ctx.rotate(state.ballRot);
    ctx.beginPath();
    ctx.ellipse(-radius * 0.08, 0, radius * 0.62, radius * 0.2, -0.45, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = Math.max(1, cell * 0.035);
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.ellipse(-radius * 0.32, -radius * 0.38, radius * 0.22, radius * 0.13, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fill();
    ctx.restore();
  } else {
    drawToken(
      ctx,
      state.pieceId,
      cell,
      state.stride,
      state.ballRot < 0 ? -1 : 1,
      bx,
      by,
      rgbCss(coat),
      Math.abs(state.ballRot),
    );
  }

  if (state.hint && state.hintLife > 0) {
    const alpha = Math.min(1, state.hintLife);
    const len = cell * 0.85;
    ctx.save();
    ctx.translate(bx, by);
    const ang = state.hint === "U" ? -Math.PI / 2 : state.hint === "D" ? Math.PI / 2 : state.hint === "L" ? Math.PI : 0;
    ctx.rotate(ang);
    ctx.globalAlpha = 0.35 + alpha * 0.65;
    ctx.fillStyle = "#f7f3ec";
    ctx.strokeStyle = "rgba(20,12,8,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(radius * 0.3, -cell * 0.16);
    ctx.lineTo(radius * 0.3 + len, -cell * 0.16);
    ctx.lineTo(radius * 0.3 + len, -cell * 0.32);
    ctx.lineTo(radius * 0.3 + len + cell * 0.34, 0);
    ctx.lineTo(radius * 0.3 + len, cell * 0.32);
    ctx.lineTo(radius * 0.3 + len, cell * 0.16);
    ctx.lineTo(radius * 0.3, cell * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
