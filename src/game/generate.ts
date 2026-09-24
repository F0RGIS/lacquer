import { LEVELS, type Difficulty, type Level } from "@/game/levels";
import {
  DELTA,
  DIRS,
  freshPainted,
  fullMask,
  parseGrid,
  reachableMask,
  solve,
  type Dir,
} from "@/game/logic";

const OPP: Record<Dir, Dir> = { U: "D", D: "U", L: "R", R: "L" };

function shuffle<T>(list: T[]): T[] {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = swap;
  }
  return copy;
}

function tierOf(n: number): { w: number; h: number; segs: number; spurs: number; maxLen: number } {
  const tier = Math.min(7, Math.floor(Math.max(0, n - 1) / 3));
  return {
    w: Math.min(12, 7 + Math.floor(tier / 2)),
    h: Math.min(10, 5 + Math.floor(tier / 2)),
    segs: Math.min(8, 4 + Math.floor((tier + 1) / 2)),
    spurs: tier < 2 ? 0 : tier < 5 ? 1 : 2,
    maxLen: tier < 4 ? 3 : 4,
  };
}

function difficultyFor(par: number, cells: number): Difficulty {
  if (par <= 4 && cells < 18) return "Easy";
  if (par <= 7) return "Tricky";
  if (par <= 11) return "Hard";
  return "Impossible";
}

function inside(r: number, c: number, h: number, w: number): boolean {
  return r > 0 && c > 0 && r < h - 1 && c < w - 1;
}

function carve(n: number): string[] | null {
  const spec = tierOf(n);
  const { w, h } = spec;
  const grid = Array.from({ length: h }, () => Array.from({ length: w }, () => "#"));
  let r = 1 + Math.floor(Math.random() * (h - 2));
  let c = 1 + Math.floor(Math.random() * (w - 2));
  grid[r]![c] = ".";
  const startR = r;
  const startC = c;
  let dir: Dir = DIRS[Math.floor(Math.random() * DIRS.length)]!;
  const stops: { r: number; c: number }[] = [];
  let placed = 0;

  for (let s = 0; s < spec.segs; s++) {
    let landed = false;
    for (const d of shuffle(DIRS.filter((candidate) => candidate !== OPP[dir]))) {
      const len = 2 + Math.floor(Math.random() * (spec.maxLen - 1));
      const cells: { r: number; c: number }[] = [];
      let rr = r;
      let cc = c;
      let ok = true;
      for (let i = 0; i < len; i++) {
        rr += DELTA[d].dr;
        cc += DELTA[d].dc;
        if (!inside(rr, cc, h, w) || grid[rr]![cc] !== "#") {
          ok = false;
          break;
        }
        cells.push({ r: rr, c: cc });
      }
      if (!ok || cells.length < 2) continue;
      const end = cells[cells.length - 1]!;
      const sr = end.r + DELTA[d].dr;
      const sc = end.c + DELTA[d].dc;
      if (inside(sr, sc, h, w) && grid[sr]![sc] !== "#") continue;
      for (const cell of cells) grid[cell.r]![cell.c] = ".";
      r = end.r;
      c = end.c;
      dir = d;
      stops.push({ r, c });
      placed += 1;
      landed = true;
      break;
    }
    if (!landed) break;
  }

  if (placed < Math.max(3, spec.segs - 1)) return null;

  let spurs = 0;
  for (const stop of shuffle(stops)) {
    if (spurs >= spec.spurs) break;
    for (const d of shuffle([...DIRS])) {
      const len = 2 + Math.floor(Math.random() * 2);
      const cells: { r: number; c: number }[] = [];
      let rr = stop.r;
      let cc = stop.c;
      let ok = true;
      for (let i = 0; i < len; i++) {
        rr += DELTA[d].dr;
        cc += DELTA[d].dc;
        if (!inside(rr, cc, h, w) || grid[rr]![cc] !== "#") {
          ok = false;
          break;
        }
        cells.push({ r: rr, c: cc });
      }
      if (!ok || cells.length < 2) continue;
      const end = cells[cells.length - 1]!;
      const sr = end.r + DELTA[d].dr;
      const sc = end.c + DELTA[d].dc;
      if (inside(sr, sc, h, w) && grid[sr]![sc] !== "#") continue;
      for (const cell of cells) grid[cell.r]![cell.c] = ".";
      spurs += 1;
      break;
    }
  }

  grid[startR]![startC] = "@";
  return grid.map((row) => row.join(""));
}

function accept(n: number, rows: string[]): Level | null {
  let grid;
  try {
    grid = parseGrid(rows);
  } catch {
    return null;
  }
  if (grid.open.length < 8 || grid.open.length > 32) return null;
  if (reachableMask(grid, grid.start.r, grid.start.c) !== fullMask(grid)) return null;
  const solved = solve(grid, grid.start.r, grid.start.c, freshPainted(grid), 60_000);
  const minMoves = n < 4 ? 3 : n < 9 ? 4 : n < 15 ? 5 : 6;
  if (!solved || solved.limited || solved.dirs.length < minMoves || solved.dirs.length > 16) return null;
  const stamp = Math.floor(Math.random() * 1e9).toString(36);
  return {
    id: `cast-${n}-${stamp}`,
    name: `Cast ${n}`,
    difficulty: difficultyFor(solved.dirs.length, grid.open.length),
    par: solved.dirs.length,
    rows,
    solution: solved.dirs,
  };
}

function fallback(n: number): Level {
  const base = LEVELS[(n - 1) % LEVELS.length]!;
  return {
    id: `cast-${n}-${Math.floor(Math.random() * 1e9).toString(36)}`,
    name: `Cast ${n}`,
    difficulty: base.difficulty,
    par: base.par,
    rows: base.rows.slice(),
    solution: base.solution.slice(),
  };
}

/** A new board, kept only when a full coat is possible. */
export function generateLevel(n: number): Level {
  const started = performance.now();
  for (let attempt = 0; attempt < 14 && performance.now() - started < 90; attempt++) {
    const rows = carve(Math.max(1, n));
    if (!rows) continue;
    const level = accept(Math.max(1, n), rows);
    if (level) return level;
  }
  return fallback(Math.max(1, n));
}
