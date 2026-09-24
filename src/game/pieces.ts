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
  { id: "pawn", name: "Pawn", kind: "pawn", price: 45, detail: "Steps from square to square" },
  { id: "knight", name: "Knight", kind: "knight", price: 135, detail: "Hops along the groove" },
  { id: "bishop", name: "Bishop", kind: "bishop", price: 135, detail: "Glides with a lean" },
  { id: "rook", name: "Rook", kind: "rook", price: 225, detail: "Marches straight ahead" },
  { id: "queen", name: "Queen", kind: "queen", price: 405, detail: "Sweeps low across the squares" },
  { id: "king", name: "King", kind: "king", price: 450, detail: "Walks one careful step at a time" },
  { id: "cube", name: "Cube", kind: "cube", price: 90, detail: "Tumbles onto each new square" },
  { id: "pyramid", name: "Pyramid", kind: "pyramid", price: 150, detail: "Tips from point to point" },
];

export function pieceById(id: string): Piece {
  return PIECES.find((piece) => piece.id === id) ?? PIECES[0]!;
}

const reducedMotion =
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

type RGB = [number, number, number];
type Vec = { x: number; y: number; z: number };

const IVORY: RGB = [236, 226, 206];
const LIGHT = { x: -0.42, y: 0.82, z: 0.38 };

function v(x: number, y: number, z: number): Vec {
  return { x, y, z };
}

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: Vec, b: Vec): Vec {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function norm(a: Vec): Vec {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function rotX(p: Vec, a: number): Vec {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

function rotY(p: Vec, a: number): Vec {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

function rotZ(p: Vec, a: number): Vec {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}

type Face = { pts: Vec[]; color: RGB };

function project(p: Vec, cell: number): { x: number; y: number; z: number } {
  const q = rotX(rotY(p, 0.72), -0.58);
  return { x: q.x * cell, y: -q.y * cell, z: q.z };
}

function lit(rgb: RGB, n: Vec): string {
  const L = norm(LIGHT);
  let nd = dot(norm(n), L);
  if (nd < 0) nd = -nd * 0.55;
  const lambert = 0.32 + 0.68 * nd;
  const spec = Math.pow(Math.max(0, nd), 16) * 0.28;
  const r = Math.min(255, rgb[0] * lambert + 255 * spec);
  const g = Math.min(255, rgb[1] * lambert + 244 * spec);
  const b = Math.min(255, rgb[2] * lambert + 220 * spec);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function drawMesh(ctx: CanvasRenderingContext2D, faces: Face[], cell: number, edge: number): void {
  const drawn = faces.map((face) => {
    const pts = face.pts.map((p) => project(p, cell));
    const z = pts.reduce((sum, p) => sum + p.z, 0) / pts.length;
    const n = cross(sub(face.pts[1]!, face.pts[0]!), sub(face.pts[2]!, face.pts[0]!));
    return { pts, z, fill: lit(face.color, n) };
  });
  drawn.sort((a, b) => a.z - b.z);
  for (const face of drawn) {
    const first = face.pts[0];
    if (!first) continue;
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < face.pts.length; i++) {
      const p = face.pts[i]!;
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = face.fill;
    ctx.fill();
    if (edge > 0) {
      ctx.strokeStyle = `rgba(24,14,8,${edge})`;
      ctx.lineWidth = Math.max(0.8, cell * 0.016);
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }
}

function lathe(profile: { y: number; r: number }[], segs: number, color: RGB): Face[] {
  const rings = profile.map((row) => {
    const ring: Vec[] = [];
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      ring.push(v(Math.cos(a) * row.r, row.y, Math.sin(a) * row.r));
    }
    return ring;
  });
  const faces: Face[] = [];
  for (let j = 0; j < rings.length - 1; j++) {
    const a = rings[j]!;
    const b = rings[j + 1]!;
    for (let i = 0; i < segs; i++) {
      const i2 = (i + 1) % segs;
      faces.push({ pts: [a[i]!, a[i2]!, b[i2]!, b[i]!], color });
    }
  }
  return faces;
}

function box(cx: number, cy: number, cz: number, w: number, h: number, d: number, color: RGB): Face[] {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  const z0 = cz - d / 2;
  const z1 = cz + d / 2;
  return [
    { pts: [v(x0, y0, z0), v(x1, y0, z0), v(x1, y0, z1), v(x0, y0, z1)], color },
    { pts: [v(x0, y1, z1), v(x1, y1, z1), v(x1, y1, z0), v(x0, y1, z0)], color },
    { pts: [v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1)], color },
    { pts: [v(x1, y0, z0), v(x0, y0, z0), v(x0, y1, z0), v(x1, y1, z0)], color },
    { pts: [v(x0, y0, z0), v(x0, y0, z1), v(x0, y1, z1), v(x0, y1, z0)], color },
    { pts: [v(x1, y0, z1), v(x1, y0, z0), v(x1, y1, z0), v(x1, y1, z1)], color },
  ];
}

function mapFaces(faces: Face[], fn: (p: Vec) => Vec): Face[] {
  return faces.map((face) => ({ color: face.color, pts: face.pts.map(fn) }));
}

function pawnMesh(): Face[] {
  return lathe(
    [
      { y: 0, r: 0.3 },
      { y: 0.05, r: 0.32 },
      { y: 0.1, r: 0.22 },
      { y: 0.18, r: 0.14 },
      { y: 0.4, r: 0.11 },
      { y: 0.48, r: 0.16 },
      { y: 0.54, r: 0.09 },
      { y: 0.62, r: 0.15 },
      { y: 0.7, r: 0.19 },
      { y: 0.78, r: 0.19 },
      { y: 0.86, r: 0.13 },
      { y: 0.91, r: 0.05 },
    ],
    18,
    IVORY,
  );
}

function rookMesh(): Face[] {
  const body = lathe(
    [
      { y: 0, r: 0.34 },
      { y: 0.08, r: 0.36 },
      { y: 0.14, r: 0.24 },
      { y: 0.58, r: 0.24 },
      { y: 0.66, r: 0.32 },
      { y: 0.74, r: 0.32 },
    ],
    12,
    IVORY,
  );
  const merlons: Face[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    merlons.push(...box(Math.cos(a) * 0.2, 0.84, Math.sin(a) * 0.2, 0.14, 0.16, 0.14, IVORY));
  }
  return [...body, ...merlons];
}

function bishopMesh(): Face[] {
  const body = lathe(
    [
      { y: 0, r: 0.34 },
      { y: 0.08, r: 0.36 },
      { y: 0.14, r: 0.2 },
      { y: 0.48, r: 0.12 },
      { y: 0.62, r: 0.2 },
      { y: 0.78, r: 0.16 },
      { y: 0.96, r: 0.05 },
      { y: 1.02, r: 0.02 },
    ],
    14,
    IVORY,
  );
  const slit = box(0, 0.72, 0.1, 0.025, 0.22, 0.04, [48, 36, 26]);
  return [...body, ...slit];
}

function queenMesh(): Face[] {
  const body = lathe(
    [
      { y: 0, r: 0.36 },
      { y: 0.08, r: 0.38 },
      { y: 0.16, r: 0.2 },
      { y: 0.46, r: 0.14 },
      { y: 0.58, r: 0.26 },
      { y: 0.66, r: 0.22 },
      { y: 0.74, r: 0.16 },
      { y: 0.84, r: 0.1 },
      { y: 0.9, r: 0.04 },
    ],
    14,
    IVORY,
  );
  const spikes: Face[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * 0.2;
    const z = Math.sin(a) * 0.2;
    spikes.push(
      { pts: [v(x - 0.05, 0.7, z), v(x + 0.05, 0.7, z), v(x, 0.98, z + 0.02)], color: IVORY },
      { pts: [v(x, 0.7, z - 0.05), v(x, 0.7, z + 0.05), v(x, 0.98, z)], color: IVORY },
    );
  }
  return [...body, ...spikes];
}

function kingMesh(): Face[] {
  const body = lathe(
    [
      { y: 0, r: 0.36 },
      { y: 0.08, r: 0.38 },
      { y: 0.16, r: 0.22 },
      { y: 0.5, r: 0.16 },
      { y: 0.62, r: 0.28 },
      { y: 0.72, r: 0.2 },
      { y: 0.8, r: 0.1 },
      { y: 0.86, r: 0.06 },
    ],
    14,
    IVORY,
  );
  return [...body, ...box(0, 1.02, 0, 0.07, 0.28, 0.07, IVORY), ...box(0, 1.08, 0, 0.24, 0.07, 0.07, IVORY)];
}

function knightMesh(facing: number): Face[] {
  const base = lathe(
    [
      { y: 0, r: 0.32 },
      { y: 0.06, r: 0.34 },
      { y: 0.12, r: 0.24 },
      { y: 0.18, r: 0.2 },
    ],
    14,
    IVORY,
  );
  const side: [number, number][] = [
    [-0.2, 0.16],
    [0.2, 0.16],
    [0.12, 0.3],
    [-0.04, 0.34],
    [-0.16, 0.5],
    [-0.12, 0.66],
    [0.0, 0.78],
    [0.08, 0.66],
    [0.22, 0.6],
    [0.34, 0.52],
    [0.28, 0.42],
    [0.1, 0.4],
    [-0.02, 0.32],
    [-0.2, 0.28],
  ];
  const depth = 0.2;
  const faces: Face[] = [];
  const front = side.map(([x, y]) => v(x * facing, y, depth));
  const back = side.map(([x, y]) => v(x * facing, y, -depth));
  faces.push({ pts: front, color: IVORY });
  faces.push({ pts: [...back].reverse(), color: IVORY });
  for (let i = 0; i < side.length; i++) {
    const j = (i + 1) % side.length;
    faces.push({ pts: [front[i]!, front[j]!, back[j]!, back[i]!], color: IVORY });
  }
  const eye = box(0.14 * facing, 0.6, depth * 0.35, 0.05, 0.05, 0.04, [42, 30, 20]);
  return [...base, ...faces, ...eye];
}

function cubeMesh(spin: number, color: RGB): Face[] {
  const h = 0.28;
  const angle = reducedMotion ? 0.5 : spin / 2;
  const edgeZ = h;
  const tumble = (p: Vec) => {
    const q = rotX(v(p.x, p.y, p.z - edgeZ), angle);
    return v(q.x, q.y, q.z + edgeZ);
  };
  return mapFaces(box(0, h, 0, h * 2, h * 2, h * 2, color), tumble);
}

function pyramidMesh(stride: number, spin: number, color: RGB): Face[] {
  const b = 0.28;
  const h = 0.62;
  const frac = stride - Math.floor(stride);
  const tip = reducedMotion ? 0.35 : Math.sin(frac * Math.PI) * 0.95;
  const yaw = reducedMotion ? 0.4 : spin * 0.35;
  const edgeZ = b;
  const pose = (p: Vec) => {
    const spun = rotY(p, yaw);
    const q = rotX(v(spun.x, spun.y, spun.z - edgeZ), tip);
    return v(q.x, q.y, q.z + edgeZ);
  };
  const apex = v(0, h, 0);
  const base = [v(-b, 0, -b), v(b, 0, -b), v(b, 0, b), v(-b, 0, b)];
  const faces: Face[] = [{ pts: base, color }];
  for (let i = 0; i < 4; i++) {
    faces.push({ pts: [base[i]!, base[(i + 1) % 4]!, apex], color });
  }
  return mapFaces(faces, pose);
}

function contactShadow(
  ctx: CanvasRenderingContext2D,
  cell: number,
  radius: number,
  lift: number,
  shape: "round" | "square",
): void {
  const alpha = 0.28 * Math.max(0.4, 1 - lift * 1.6);
  ctx.beginPath();
  if (shape === "square") {
    const corners = [v(-radius, 0.004, -radius), v(radius, 0.004, -radius), v(radius, 0.004, radius), v(-radius, 0.004, radius)];
    corners.forEach((corner, i) => {
      const p = project(corner, cell);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
  } else {
    for (let i = 0; i <= 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const p = project(v(Math.cos(a) * radius, 0.004, Math.sin(a) * radius), cell);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = `rgba(8,5,2,${alpha})`;
  ctx.fill();
}

function hop(stride: number, amp: number): number {
  if (reducedMotion || amp === 0) return 0;
  const f = stride - Math.floor(stride);
  return Math.sin(f * Math.PI) * amp;
}

function parseCoat(fill: string): RGB {
  const m = fill.match(/\d+/g);
  if (!m || m.length < 3) return [44, 74, 232];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
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
  spin = 0,
): void {
  const piece = pieceById(pieceId);
  if (piece.kind === "marble") return;
  const coat = parseCoat(coatFill);
  const amp =
    piece.kind === "knight"
      ? 0.22
      : piece.kind === "pawn"
        ? 0.14
        : piece.kind === "bishop"
          ? 0.1
          : piece.kind === "rook"
            ? 0.06
            : piece.kind === "queen"
              ? 0.04
              : piece.kind === "king"
                ? 0.08
                : piece.kind === "cube" || piece.kind === "pyramid"
                  ? 0.04
                  : 0;
  const lift = hop(stride, amp);
  let faces: Face[];
  let shadow = 0;
  if (piece.kind === "pawn") faces = pawnMesh();
  else if (piece.kind === "rook") faces = rookMesh();
  else if (piece.kind === "bishop") {
    const lean = reducedMotion ? 0 : Math.sin((stride - Math.floor(stride)) * Math.PI) * 0.22;
    faces = mapFaces(bishopMesh(), (p) => rotZ(p, lean * facing));
  } else if (piece.kind === "queen") faces = queenMesh();
  else if (piece.kind === "king") faces = kingMesh();
  else if (piece.kind === "knight") faces = knightMesh(facing < 0 ? -1 : 1);
  else if (piece.kind === "cube") {
    faces = cubeMesh(spin, coat);
    shadow = 0.16;
  } else {
    faces = pyramidMesh(stride, spin, coat);
    shadow = 0.16;
  }
  faces = mapFaces(faces, (p) => v(p.x, p.y + lift, p.z));

  ctx.save();
  ctx.translate(x, y + cell * 0.16);
  const square = piece.kind === "cube" || piece.kind === "pyramid";
  if (shadow > 0) contactShadow(ctx, cell, shadow, lift, square ? "square" : "round");
  const hard = piece.kind === "cube" || piece.kind === "pyramid" || piece.kind === "knight";
  drawMesh(ctx, faces, cell, hard ? 0.28 : 0);
  ctx.restore();
}
