export type Dir = "U" | "D" | "L" | "R";

export const DIRS: Dir[] = ["U", "D", "L", "R"];

export const DELTA: Record<Dir, { dr: number; dc: number }> = {
  U: { dr: -1, dc: 0 },
  D: { dr: 1, dc: 0 },
  L: { dr: 0, dc: -1 },
  R: { dr: 0, dc: 1 },
};

export type Grid = {
  rows: number;
  cols: number;
  /** -1 wall, otherwise index into the open-cell list */
  id: Int16Array;
  open: { r: number; c: number }[];
  start: { r: number; c: number };
};

export function parseGrid(rows: string[]): Grid {
  const cols = rows[0]?.length ?? 0;
  if (!rows.length || rows.some((row) => row.length !== cols)) {
    throw new Error("Level rows must be a non-empty rectangle");
  }
  const id = new Int16Array(rows.length * cols).fill(-1);
  const open: { r: number; c: number }[] = [];
  let start: { r: number; c: number } | null = null;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = rows[r]![c];
      if (ch === "#" || ch === " ") continue;
      if (ch !== "." && ch !== "@") throw new Error(`Bad cell '${ch}'`);
      const index = open.length;
      id[r * cols + c] = index;
      open.push({ r, c });
      if (ch === "@") {
        if (start) throw new Error("Level has two starts");
        start = { r, c };
      }
    }
  }
  if (!start) throw new Error("Level has no start");
  return { rows: rows.length, cols, id, open, start };
}

export function cellId(grid: Grid, r: number, c: number): number {
  if (r < 0 || c < 0 || r >= grid.rows || c >= grid.cols) return -1;
  return grid.id[r * grid.cols + c] ?? -1;
}

/** Cells the marble crosses, including the cell it starts in. Length 1 = blocked. */
export function slide(grid: Grid, r: number, c: number, dir: Dir): { r: number; c: number }[] {
  const { dr, dc } = DELTA[dir];
  const path = [{ r, c }];
  let cr = r;
  let cc = c;
  for (;;) {
    const nr = cr + dr;
    const nc = cc + dc;
    if (cellId(grid, nr, nc) < 0) break;
    cr = nr;
    cc = nc;
    path.push({ r: cr, c: cc });
  }
  return path;
}

export function fullMask(grid: Grid): bigint {
  if (grid.open.length > 60) throw new Error("Level too large to mask");
  return (1n << BigInt(grid.open.length)) - 1n;
}

export function maskOf(grid: Grid, painted: Uint8Array): bigint {
  let m = 0n;
  for (let i = 0; i < painted.length; i++) if (painted[i]) m |= 1n << BigInt(i);
  return m;
}

export function paintPath(grid: Grid, painted: Uint8Array, path: { r: number; c: number }[]): number {
  let fresh = 0;
  for (const cell of path) {
    const id = cellId(grid, cell.r, cell.c);
    if (id >= 0 && !painted[id]) {
      painted[id] = 1;
      fresh++;
    }
  }
  return fresh;
}

/** Every open cell is either already coated or still lies on a slide we can reach. */
export function reachableMask(grid: Grid, r: number, c: number): bigint {
  const seen = new Uint8Array(grid.open.length);
  const queue: { r: number; c: number }[] = [{ r, c }];
  const sid = cellId(grid, r, c);
  if (sid < 0) return 0n;
  seen[sid] = 1;
  let mask = 1n << BigInt(sid);
  let q = 0;
  while (q < queue.length) {
    const cur = queue[q++]!;
    for (const dir of DIRS) {
      const path = slide(grid, cur.r, cur.c, dir);
      if (path.length < 2) continue;
      for (const cell of path) {
        const id = cellId(grid, cell.r, cell.c);
        if (id >= 0) mask |= 1n << BigInt(id);
      }
      const end = path[path.length - 1]!;
      const eid = cellId(grid, end.r, end.c);
      if (eid >= 0 && !seen[eid]) {
        seen[eid] = 1;
        queue.push(end);
      }
    }
  }
  return mask;
}

export function isComplete(grid: Grid, painted: Uint8Array): boolean {
  for (let i = 0; i < painted.length; i++) if (!painted[i]) return false;
  return true;
}

export function coatedCount(painted: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < painted.length; i++) if (painted[i]) n++;
  return n;
}

/** Still missing lacquer, and no sequence of slides can reach it. */
export function isStuck(grid: Grid, r: number, c: number, painted: Uint8Array): boolean {
  if (isComplete(grid, painted)) return false;
  const have = maskOf(grid, painted);
  const can = reachableMask(grid, r, c);
  return (have | can) !== fullMask(grid);
}

export type SolveResult = { dirs: Dir[]; expanded: number; limited?: boolean };

/**
 * Shortest sequence of slides that coats every open cell.
 * Returns null if unsolvable or the node budget runs out.
 */
export function solve(
  grid: Grid,
  r0: number,
  c0: number,
  painted0: Uint8Array,
  budget = 500_000,
): SolveResult | null {
  const goal = fullMask(grid);
  const startMask = maskOf(grid, painted0);
  if (startMask === goal) return { dirs: [], expanded: 0 };
  if ((startMask | reachableMask(grid, r0, c0)) !== goal) return null;

  type Node = { r: number; c: number; mask: bigint; parent: number; dir: Dir | null };
  const nodes: Node[] = [{ r: r0, c: c0, mask: startMask, parent: -1, dir: null }];
  const seen = new Set<string>([`${r0},${c0},${startMask}`]);
  let q = 0;
  let expanded = 0;
  while (q < nodes.length) {
    if (expanded++ > budget) return { dirs: [], expanded, limited: true };
    const cur = nodes[q++]!;
    for (const dir of DIRS) {
      const path = slide(grid, cur.r, cur.c, dir);
      if (path.length < 2) continue;
      let mask = cur.mask;
      for (const cell of path) {
        const id = cellId(grid, cell.r, cell.c);
        if (id >= 0) mask |= 1n << BigInt(id);
      }
      const end = path[path.length - 1]!;
      if ((mask | reachableMask(grid, end.r, end.c)) !== goal) continue;
      const key = `${end.r},${end.c},${mask}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const idx = nodes.length;
      nodes.push({ r: end.r, c: end.c, mask, parent: q - 1, dir });
      if (mask === goal) {
        const dirs: Dir[] = [];
        let i = idx;
        while (i > 0) {
          const n = nodes[i]!;
          if (n.dir) dirs.push(n.dir);
          i = n.parent;
        }
        dirs.reverse();
        return { dirs, expanded };
      }
    }
  }
  return null;
}

export function freshPainted(grid: Grid): Uint8Array {
  const painted = new Uint8Array(grid.open.length);
  const id = cellId(grid, grid.start.r, grid.start.c);
  if (id >= 0) painted[id] = 1;
  return painted;
}

export function starsFor(moves: number, par: number): 1 | 2 | 3 {
  if (moves <= par) return 3;
  if (moves <= par + 2) return 2;
  return 1;
}
