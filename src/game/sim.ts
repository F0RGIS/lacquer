import { sfx } from "@/game/audio";
import { COATS, DEFAULT_COAT } from "@/game/coats";
import { FRAMES } from "@/game/frames";
import type { Particle } from "@/game/draw";
import { generateLevel } from "@/game/generate";
import { LEVELS, type Level } from "@/game/levels";
import { materialById, DEFAULT_BOARD, SHOP_BOARDS, type BoardMaterial } from "@/game/materials";
import { DEFAULT_PIECE, PIECES } from "@/game/pieces";
import {
  cellId,
  coatedCount,
  freshPainted,
  isComplete,
  isStuck,
  parseGrid,
  slide,
  solve,
  starsFor,
  type Dir,
  type Grid,
} from "@/game/logic";

export type Phase = "idle" | "rolling" | "won" | "stuck";

export type Hud = {
  levelIndex: number;
  name: string;
  difficulty: string;
  moves: number;
  par: number;
  coated: number;
  total: number;
  phase: Phase;
  canUndo: boolean;
  assisted: boolean;
  retried: boolean;
  demo: boolean;
  material: string;
  endless: boolean;
};

type Snap = { r: number; c: number; painted: Uint8Array; moves: number };

type Roll = {
  path: { r: number; c: number }[];
  dir: Dir;
  t: number;
  dur: number;
  cursor: number;
  dist: number;
};

const SAVE_KEY = "lacquer-v3";

export type Best = { moves: number; stars: number };

export type Save = {
  v: 3;
  level: number;
  best: Record<string, Best>;
  muted: boolean;
  gems: number;
  coat: string;
  ownedCoats: string[];
  board: string;
  ownedBoards: string[];
  piece: string;
  ownedPieces: string[];
  frame: string;
  ownedFrames: string[];
  run: number;
};

export function emptySave(): Save {
  return {
    v: 3,
    level: 0,
    best: {},
    muted: false,
    gems: 0,
    coat: DEFAULT_COAT,
    ownedCoats: [DEFAULT_COAT],
    board: DEFAULT_BOARD,
    ownedBoards: [DEFAULT_BOARD],
    piece: DEFAULT_PIECE,
    ownedPieces: [DEFAULT_PIECE],
    frame: "cotton",
    ownedFrames: ["cotton"],
    run: 0,
  };
}

function asIds(value: unknown, known: Set<string>, fallback: string): string[] {
  const ids = (Array.isArray(value) ? value : []).filter((id): id is string => typeof id === "string" && known.has(id));
  if (!ids.includes(fallback)) ids.unshift(fallback);
  return ids;
}

export function loadSave(): Save {
  const empty = emptySave();
  if (typeof localStorage === "undefined") return empty;
  try {
    const raw =
      localStorage.getItem(SAVE_KEY) ?? localStorage.getItem("lacquer-v2") ?? localStorage.getItem("lacquer-v1");
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as {
      v?: number;
      level?: number;
      best?: Record<string, Best>;
      muted?: boolean;
      gems?: number;
      coat?: string;
      owned?: unknown;
      ownedCoats?: unknown;
      board?: string;
      ownedBoards?: unknown;
      piece?: string;
      ownedPieces?: unknown;
      frame?: string;
      ownedFrames?: unknown;
      run?: number;
    };
    if (parsed.v !== 1 && parsed.v !== 2 && parsed.v !== 3) return empty;
    const coatIds = new Set(COATS.map((coat) => coat.id));
    const ownedCoats = asIds(parsed.ownedCoats ?? parsed.owned, coatIds, DEFAULT_COAT);
    const boardIds = new Set(SHOP_BOARDS.map((board) => board.id));
    const pieceIds = new Set(PIECES.map((piece) => piece.id));
    const frameIds = new Set(FRAMES.map((frame) => frame.id));
    const coat = typeof parsed.coat === "string" && coatIds.has(parsed.coat) ? parsed.coat : DEFAULT_COAT;
    const board = typeof parsed.board === "string" && boardIds.has(parsed.board) ? parsed.board : DEFAULT_BOARD;
    const piece = typeof parsed.piece === "string" && pieceIds.has(parsed.piece) ? parsed.piece : DEFAULT_PIECE;
    const frame = typeof parsed.frame === "string" && frameIds.has(parsed.frame) ? parsed.frame : "cotton";
    return {
      v: 3,
      level: typeof parsed.level === "number" ? parsed.level : 0,
      best: parsed.best && typeof parsed.best === "object" ? parsed.best : {},
      muted: Boolean(parsed.muted),
      gems: parsed.v !== 1 && typeof parsed.gems === "number" ? Math.max(0, Math.floor(parsed.gems)) : 0,
      coat,
      ownedCoats,
      board,
      ownedBoards: asIds(parsed.ownedBoards, boardIds, DEFAULT_BOARD),
      piece,
      ownedPieces: asIds(parsed.ownedPieces, pieceIds, DEFAULT_PIECE),
      frame,
      ownedFrames: asIds(parsed.ownedFrames, frameIds, "cotton"),
      run: parsed.v !== 1 && typeof parsed.run === "number" ? Math.max(0, Math.floor(parsed.run)) : 0,
    };
  } catch {
    return empty;
  }
}

export function writeSave(save: Save): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* ignore quota */
  }
}

function easeRoll(t: number): number {
  if (t < 0.12) {
    const u = t / 0.12;
    return 0.18 * u * u;
  }
  if (t < 0.78) return 0.18 + 0.7 * ((t - 0.12) / 0.66);
  const u = (t - 0.78) / 0.22;
  return 0.88 + 0.12 * (1 - (1 - u) ** 3);
}

export class Session {
  grid: Grid;
  level: Level;
  levelIndex: number;
  r: number;
  c: number;
  painted: Uint8Array;
  wet: Float32Array;
  moves = 0;
  phase: Phase = "idle";
  assisted = false;
  retried = false;
  demo = false;
  history: Snap[] = [];
  queue: Dir | null = null;
  roll: Roll | null = null;
  ballX: number;
  ballY: number;
  ballRot = 0;
  stride = 0;
  squashX = 1;
  squashY = 1;
  particles: Particle[] = [];
  trauma = 0;
  hint: Dir | null = null;
  hintLife = 0;
  reduced = false;
  material: BoardMaterial;
  coatId = DEFAULT_COAT;
  pieceId = DEFAULT_PIECE;
  endless = false;
  run = 0;
  demoStep = 0;
  demoGap = 0.55;
  demoHold = 0;
  private lastHud = "";
  private onHud: (hud: Hud) => void;
  private onWin: (stars: 1 | 2 | 3) => void;

  constructor(onHud: (hud: Hud) => void, onWin: (stars: 1 | 2 | 3) => void) {
    this.onHud = onHud;
    this.onWin = onWin;
    this.levelIndex = LEVELS.length - 1;
    this.level = LEVELS[this.levelIndex]!;
    this.material = materialById(DEFAULT_BOARD);
    this.grid = parseGrid(this.level.rows);
    this.painted = freshPainted(this.grid);
    this.wet = new Float32Array(this.grid.open.length);
    this.r = this.grid.start.r;
    this.c = this.grid.start.c;
    this.ballX = this.c + 0.5;
    this.ballY = this.r + 0.5;
    this.demo = true;
    this.reduced =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  hud(): Hud {
    return {
      levelIndex: this.levelIndex,
      name: this.level.name,
      difficulty: this.level.difficulty,
      moves: this.moves,
      par: this.level.par,
      coated: coatedCount(this.painted),
      total: this.grid.open.length,
      phase: this.phase,
      canUndo: this.history.length > 0 && this.phase !== "rolling",
      assisted: this.assisted,
      retried: this.retried,
      demo: this.demo,
      material: this.material.name,
      endless: this.endless,
    };
  }

  publish(): void {
    const hud = this.hud();
    const key = `${hud.levelIndex}|${hud.moves}|${hud.coated}|${hud.phase}|${hud.canUndo}|${hud.assisted}|${hud.retried}|${hud.demo}|${hud.total}`;
    if (key === this.lastHud) return;
    this.lastHud = key;
    this.onHud(hud);
  }

  load(index: number, demo = false): void {
    this.levelIndex = (index + LEVELS.length) % LEVELS.length;
    this.endless = false;
    this.apply(LEVELS[this.levelIndex]!, this.levelIndex, demo);
  }

  nextCast(): void {
    this.run += 1;
    const level = generateLevel(this.run);
    this.endless = true;
    this.apply(level, this.run, false);
  }

  private apply(level: Level, index: number, demo: boolean): void {
    this.level = level;
    this.levelIndex = index;
    this.grid = parseGrid(level.rows);
    this.painted = freshPainted(this.grid);
    this.wet = new Float32Array(this.grid.open.length);
    this.r = this.grid.start.r;
    this.c = this.grid.start.c;
    this.ballX = this.c + 0.5;
    this.ballY = this.r + 0.5;
    this.ballRot = 0;
    this.stride = 0;
    this.moves = 0;
    this.phase = "idle";
    this.assisted = false;
    this.retried = false;
    this.history = [];
    this.queue = null;
    this.roll = null;
    this.particles = [];
    this.trauma = 0;
    this.hint = null;
    this.hintLife = 0;
    this.demo = demo;
    this.demoStep = 0;
    this.demoGap = 0.55;
    this.demoHold = 0;
    this.squashX = 1;
    this.squashY = 1;
    this.publish();
  }

  swipe(dir: Dir): void {
    if (this.demo) return;
    if (this.phase === "won" || this.phase === "stuck") return;
    if (this.phase === "rolling") {
      this.queue = dir;
      return;
    }
    this.tryMove(dir);
  }

  undo(): void {
    if (this.demo || this.phase === "rolling" || this.history.length === 0) return;
    const snap = this.history.pop()!;
    this.r = snap.r;
    this.c = snap.c;
    this.painted = snap.painted;
    this.wet.fill(0);
    this.moves = snap.moves;
    this.ballX = this.c + 0.5;
    this.ballY = this.r + 0.5;
    this.queue = null;
    this.roll = null;
    this.hint = null;
    this.phase = "idle";
    sfx.ui();
    this.publish();
  }

  reset(): void {
    const demo = this.demo;
    this.apply(this.level, this.levelIndex, demo);
    if (!demo) {
      this.retried = true;
      sfx.ui();
      this.publish();
    }
  }

  nudge(): Dir | null {
    if (this.demo || (this.phase !== "idle" && this.phase !== "stuck")) return null;
    const found = solve(this.grid, this.r, this.c, this.painted, 250_000);
    if (!found || found.limited || found.dirs.length === 0) return null;
    this.assisted = true;
    this.hint = found.dirs[0]!;
    this.hintLife = 1.35;
    this.phase = "idle";
    sfx.ui();
    this.publish();
    return this.hint;
  }

  private tryMove(dir: Dir): void {
    const path = slide(this.grid, this.r, this.c, dir);
    if (path.length < 2) {
      this.squashX = 1.16;
      this.squashY = 0.86;
      if (!this.reduced) this.trauma = Math.min(1, this.trauma + 0.18);
      if (!this.demo) sfx.bump();
      this.spawn(this.r + 0.5, this.c + 0.5, 4, "dust");
      return;
    }
    if (!this.demo) {
      this.history.push({
        r: this.r,
        c: this.c,
        painted: this.painted.slice(),
        moves: this.moves,
      });
      this.moves += 1;
    }
    const cells = path.length - 1;
    const speed = this.reduced ? 14 : 8;
    this.roll = {
      path,
      dir,
      t: 0,
      dur: Math.max(0.16, cells / speed),
      cursor: 0,
      dist: 0,
    };
    this.phase = "rolling";
    this.hint = null;
    this.publish();
  }

  private spawn(x: number, y: number, n: number, kind: Particle["kind"]): void {
    if (this.reduced && kind !== "win") return;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 0.4 + Math.random() * (kind === "win" ? 2.4 : 1.4);
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - (kind === "dust" ? 0 : 0.2),
        life: 0.35 + Math.random() * 0.35,
        max: 0.7,
        radius: kind === "win" ? 0.06 + Math.random() * 0.06 : 0.04 + Math.random() * 0.05,
        kind,
      });
    }
  }

  private coatCell(index: number): void {
    const id = cellId(this.grid, this.roll!.path[index]!.r, this.roll!.path[index]!.c);
    if (id < 0) return;
    const fresh = !this.painted[id];
    this.painted[id] = 1;
    if (fresh) {
      this.wet[id] = 1;
      const cell = this.grid.open[id]!;
      this.spawn(cell.c + 0.5, cell.r + 0.5, 6, "paint");
      if (!this.demo) sfx.paint();
      this.publish();
    }
  }

  private finishRoll(): void {
    const roll = this.roll;
    if (!roll) return;
    const end = roll.path[roll.path.length - 1]!;
    this.r = end.r;
    this.c = end.c;
    this.ballX = end.c + 0.5;
    this.ballY = end.r + 0.5;
    for (let i = roll.cursor + 1; i < roll.path.length; i++) this.coatCell(i);
    this.roll = null;
    this.squashX = 1.3;
    this.squashY = 0.74;
    if (!this.reduced) this.trauma = Math.min(1, this.trauma + 0.42);
    this.spawn(this.ballX, this.ballY, 8, "dust");
    if (!this.demo) sfx.hit();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {
        /* some browsers throw if blocked */
      }
    }

    if (isComplete(this.grid, this.painted)) {
      this.phase = "won";
      this.spawn(this.ballX, this.ballY, 28, "win");
      this.spawn(this.ballX, this.ballY, 16, "paint");
      if (!this.reduced) this.trauma = Math.min(1, this.trauma + 0.35);
      if (this.demo) {
        this.demoHold = 1.25;
      } else {
        let stars = starsFor(this.moves, this.level.par);
        if (this.assisted) stars = (stars === 3 ? 2 : stars) as 1 | 2 | 3;
        sfx.win();
        this.onWin(stars);
      }
      this.publish();
      return;
    }

    const dead =
      isStuck(this.grid, this.r, this.c, this.painted) ||
      (!this.demo && solve(this.grid, this.r, this.c, this.painted, 250_000) === null);
    if (dead) {
      this.phase = "stuck";
      if (!this.demo) sfx.stuck();
      this.publish();
      return;
    }

    this.phase = "idle";
    this.publish();
    if (!this.demo && this.queue) {
      const next = this.queue;
      this.queue = null;
      this.tryMove(next);
    }
  }

  update(dt: number): void {
    const step = Math.min(0.05, dt);
    this.squashX += (1 - this.squashX) * (1 - Math.exp(-12 * step));
    this.squashY += (1 - this.squashY) * (1 - Math.exp(-12 * step));
    this.trauma = Math.max(0, this.trauma - 1.7 * step);
    if (this.hintLife > 0) {
      this.hintLife -= step;
      if (this.hintLife <= 0) this.hint = null;
    }
    for (let i = 0; i < this.wet.length; i++) {
      if (this.wet[i]! > 0) this.wet[i] = Math.max(0, this.wet[i]! - step * 2.4);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life -= step;
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.vy += 1.4 * step;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.roll) {
      this.roll.t += step / this.roll.dur;
      if (this.roll.t >= 1) {
        this.finishRoll();
      } else {
        const dist = easeRoll(this.roll.t) * (this.roll.path.length - 1);
        this.roll.dist = dist;
        const i = Math.min(this.roll.path.length - 2, Math.floor(dist));
        const f = dist - i;
        const a = this.roll.path[i]!;
        const b = this.roll.path[i + 1]!;
        this.ballX = a.c + (b.c - a.c) * f + 0.5;
        this.ballY = a.r + (b.r - a.r) * f + 0.5;
        const sign = this.roll.dir === "L" || this.roll.dir === "U" ? -1 : 1;
        this.ballRot = dist * sign * Math.PI;
        this.stride = dist;
        const stretch = 1 + Math.min(0.16, Math.abs(b.c - a.c + (b.r - a.r)) * 0.08);
        const along = this.roll.dir === "L" || this.roll.dir === "R";
        this.squashX = along ? stretch : 1 / stretch;
        this.squashY = along ? 1 / stretch : stretch;
        const crossed = Math.min(this.roll.path.length - 1, Math.floor(dist + 0.42));
        while (this.roll.cursor < crossed) {
          this.roll.cursor += 1;
          this.coatCell(this.roll.cursor);
          if (!this.demo) sfx.tick();
        }
      }
    } else if (this.phase === "idle") {
      this.stride = 0;
      const bob = this.reduced ? 0 : Math.sin(performance.now() / 420) * 0.025;
      this.ballX = this.c + 0.5;
      this.ballY = this.r + 0.5 + bob;
      if (this.demo) {
        this.demoGap -= step;
        if (this.demoGap <= 0) {
          const dir = this.level.solution[this.demoStep];
          if (dir) {
            this.demoStep += 1;
            this.demoGap = 0.26;
            this.tryMove(dir);
          }
        }
      }
    } else if (this.demo && this.phase === "won") {
      this.stride = 0;
      this.demoHold -= step;
      if (this.demoHold <= 0) this.load(this.levelIndex, true);
    } else {
      this.stride = 0;
    }

    this.pollPad();
  }

  private padPrev = [false, false, false, false];

  private pollPad(): void {
    if (this.demo || typeof navigator === "undefined" || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const pad = pads[0];
    if (!pad) return;
    const dirs: Dir[] = ["U", "D", "L", "R"];
    for (let i = 0; i < 4; i++) {
      const pressed = !!pad.buttons[12 + i]?.pressed;
      if (pressed && !this.padPrev[i]) this.swipe(dirs[i]!);
      this.padPrev[i] = pressed;
    }
  }
}
