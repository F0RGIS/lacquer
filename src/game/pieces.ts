export type PieceKind = "marble" | "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | "cube" | "pyramid";

export type Piece = {
  id: string;
  name: string;
  kind: PieceKind;
  price: number;
  detail: string;
};

export const DEFAULT_PIECE = "marble";

export const PIECES: Piece[] = [
  { id: "marble", name: "Marble", kind: "marble", price: 0, detail: "Rolls until it hits a wall" },
  { id: "pawn", name: "Pawn", kind: "pawn", price: 3, detail: "Steps from square to square" },
  { id: "knight", name: "Knight", kind: "knight", price: 9, detail: "Hops along the groove" },
  { id: "bishop", name: "Bishop", kind: "bishop", price: 9, detail: "Glides with a lean" },
  { id: "rook", name: "Rook", kind: "rook", price: 15, detail: "Marches straight ahead" },
  { id: "queen", name: "Queen", kind: "queen", price: 27, detail: "Sweeps low across the squares" },
  { id: "king", name: "King", kind: "king", price: 30, detail: "Walks one careful step at a time" },
  { id: "cube", name: "Cube", kind: "cube", price: 6, detail: "Tumbles onto each new square" },
  { id: "pyramid", name: "Pyramid", kind: "pyramid", price: 10, detail: "Tips from point to point" },
];

export function pieceById(id: string): Piece {
  return PIECES.find((piece) => piece.id === id) ?? PIECES[0]!;
}

const reducedMotion =
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const IVORY = "#f4efe4";
const SHADE = "#d9cbb4";
const INK = "#1c140e";

function hop(stride: number, amp: number): number {
  if (reducedMotion || amp === 0) return 0;
  const f = stride - Math.floor(stride);
  return Math.sin(f * Math.PI) * amp;
}

function stroke(ctx: CanvasRenderingContext2D, width: number): void {
  ctx.strokeStyle = INK;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function pawn(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.fillStyle = IVORY;
  ctx.beginPath();
  ctx.moveTo(-s * 0.46, s * 0.42);
  ctx.lineTo(s * 0.46, s * 0.42);
  ctx.lineTo(s * 0.28, s * 0.22);
  ctx.lineTo(-s * 0.28, s * 0.22);
  ctx.closePath();
  ctx.fill();
  stroke(ctx, s * 0.06);
  ctx.fillStyle = SHADE;
  ctx.beginPath();
  ctx.moveTo(-s * 0.22, s * 0.22);
  ctx.lineTo(s * 0.22, s * 0.22);
  ctx.lineTo(s * 0.12, -s * 0.08);
  ctx.lineTo(-s * 0.12, -s * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = IVORY;
  ctx.strokeStyle = INK;
  ctx.lineWidth = s * 0.06;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -s * 0.28, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function rook(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.fillStyle = IVORY;
  ctx.fillRect(-s * 0.34, -s * 0.16, s * 0.68, s * 0.58);
  ctx.strokeStyle = INK;
  ctx.lineWidth = s * 0.06;
  ctx.strokeRect(-s * 0.34, -s * 0.16, s * 0.68, s * 0.58);
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const x = -s * 0.34 + i * s * 0.26;
    ctx.rect(x, -s * 0.42, s * 0.16, s * 0.28);
  }
  ctx.fill();
  ctx.stroke();
}

function bishop(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.fillStyle = IVORY;
  ctx.beginPath();
  ctx.moveTo(-s * 0.4, s * 0.44);
  ctx.lineTo(s * 0.4, s * 0.44);
  ctx.lineTo(s * 0.16, -s * 0.2);
  ctx.lineTo(-s * 0.16, -s * 0.2);
  ctx.closePath();
  ctx.fill();
  stroke(ctx, s * 0.06);
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.34, s * 0.16, s * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.lineTo(0, -s * 0.2);
  ctx.stroke();
}

function crownTips(ctx: CanvasRenderingContext2D, s: number, cross: boolean): void {
  ctx.fillStyle = IVORY;
  ctx.beginPath();
  ctx.moveTo(-s * 0.42, s * 0.44);
  ctx.lineTo(s * 0.42, s * 0.44);
  ctx.quadraticCurveTo(s * 0.16, s * 0.05, s * 0.12, -s * 0.16);
  ctx.lineTo(-s * 0.12, -s * 0.16);
  ctx.quadraticCurveTo(-s * 0.16, s * 0.05, -s * 0.42, s * 0.44);
  ctx.closePath();
  ctx.fill();
  stroke(ctx, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(-s * 0.36, -s * 0.02);
  ctx.lineTo(-s * 0.24, -s * 0.42);
  ctx.lineTo(-s * 0.08, -s * 0.08);
  ctx.lineTo(0, -s * 0.5);
  ctx.lineTo(s * 0.08, -s * 0.08);
  ctx.lineTo(s * 0.24, -s * 0.42);
  ctx.lineTo(s * 0.36, -s * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (cross) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.72);
    ctx.lineTo(0, -s * 0.46);
    ctx.moveTo(-s * 0.1, -s * 0.62);
    ctx.lineTo(s * 0.1, -s * 0.62);
    ctx.stroke();
  }
}

function knight(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.fillStyle = IVORY;
  ctx.beginPath();
  ctx.moveTo(-s * 0.42, s * 0.44);
  ctx.lineTo(s * 0.38, s * 0.44);
  ctx.lineTo(s * 0.22, s * 0.22);
  ctx.lineTo(-s * 0.1, s * 0.22);
  ctx.lineTo(-s * 0.18, -s * 0.02);
  ctx.quadraticCurveTo(-s * 0.34, -s * 0.2, -s * 0.08, -s * 0.42);
  ctx.lineTo(s * 0.02, -s * 0.55);
  ctx.lineTo(s * 0.16, -s * 0.36);
  ctx.quadraticCurveTo(s * 0.42, -s * 0.28, s * 0.46, -s * 0.02);
  ctx.quadraticCurveTo(s * 0.4, s * 0.12, s * 0.1, s * 0.16);
  ctx.lineTo(-s * 0.16, s * 0.28);
  ctx.closePath();
  ctx.fill();
  stroke(ctx, s * 0.055);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(s * 0.06, -s * 0.28, s * 0.035, 0, Math.PI * 2);
  ctx.fill();
}

function cube(ctx: CanvasRenderingContext2D, s: number, stride: number, fill: string): void {
  const f = reducedMotion ? 0 : stride - Math.floor(stride);
  const ang = f * (Math.PI / 2);
  const squash = Math.max(0.18, Math.abs(Math.cos(ang)));
  ctx.fillStyle = fill;
  ctx.save();
  ctx.scale(squash, 1);
  ctx.beginPath();
  ctx.rect(-s * 0.42, -s * 0.42, s * 0.84, s * 0.84);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = s * 0.06;
  ctx.stroke();
  ctx.restore();
}

function pyramid(ctx: CanvasRenderingContext2D, s: number, stride: number, fill: string): void {
  const ang = reducedMotion ? 0 : stride * Math.PI;
  ctx.save();
  ctx.rotate(ang);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.55);
  ctx.lineTo(s * 0.5, s * 0.42);
  ctx.lineTo(-s * 0.5, s * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = s * 0.06;
  ctx.stroke();
  ctx.restore();
}

export function drawToken(
  ctx: CanvasRenderingContext2D,
  pieceId: string,
  cell: number,
  stride: number,
  facing: number,
  x: number,
  y: number,
  coatFill: string,
): void {
  const piece = pieceById(pieceId);
  if (piece.kind === "marble") return;
  const s = cell * 0.46;
  const amp =
    piece.kind === "knight"
      ? cell * 0.28
      : piece.kind === "pawn"
        ? cell * 0.16
        : piece.kind === "bishop"
          ? cell * 0.12
          : piece.kind === "rook"
            ? cell * 0.08
            : piece.kind === "queen"
              ? cell * 0.05
              : piece.kind === "king"
                ? cell * 0.1
                : 0;
  const lift = hop(stride, amp);
  const sway = reducedMotion ? 0 : Math.sin((stride - Math.floor(stride)) * Math.PI * 2) * cell * 0.03;
  ctx.save();
  ctx.translate(x + sway, y - lift + s * 0.08);
  ctx.scale(1, 0.32);
  ctx.fillStyle = "rgba(20,10,4,0.38)";
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.7 * (1 - lift / cell), s * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x + sway, y - lift);
  if (piece.kind === "knight") ctx.scale(facing < 0 ? -1 : 1, 1);
  if (piece.kind === "bishop" && !reducedMotion) {
    const f = stride - Math.floor(stride);
    ctx.rotate(Math.sin(f * Math.PI) * 0.28);
  }
  if (piece.kind === "queen") ctx.translate(0, cell * 0.08);
  if (piece.kind === "rook" && !reducedMotion) {
    const f = stride - Math.floor(stride);
    ctx.scale(1, 1 - Math.sin(f * Math.PI) * 0.08);
  }
  if (piece.kind === "pawn") pawn(ctx, s);
  else if (piece.kind === "rook") rook(ctx, s);
  else if (piece.kind === "bishop") bishop(ctx, s);
  else if (piece.kind === "queen") crownTips(ctx, s, false);
  else if (piece.kind === "king") crownTips(ctx, s, true);
  else if (piece.kind === "knight") knight(ctx, s);
  else if (piece.kind === "cube") cube(ctx, s, stride, coatFill);
  else pyramid(ctx, s, stride, coatFill);
  ctx.restore();
}
