import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Gem,
  LayoutGrid,
  Lightbulb,
  RotateCcw,
  Star,
  Undo2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { COATS, coatFillCss, coatSwatch, DEFAULT_COAT } from "@/game/coats";
import { drawBoard } from "@/game/draw";
import { DEFAULT_FRAME, FRAMES, frameById } from "@/game/frames";
import { LEVELS } from "@/game/levels";
import type { Dir } from "@/game/logic";
import { DEFAULT_BOARD, materialById, SHOP_BOARDS } from "@/game/materials";
import { DEFAULT_PIECE, PIECES } from "@/game/pieces";
import { resumeAudio, setMuted as setAudioMuted, sfx, unlockAudio } from "@/game/audio";
import { loadSave, Session, writeSave, type Best, type Hud, type Save } from "@/game/sim";

declare global {
  interface Window {
    __lacquer?: {
      ready: boolean;
      swipe: (dir: Dir) => void;
      phase: () => string;
      row: () => number;
      col: () => number;
      coated: () => number;
      total: () => number;
      moves: () => number;
      load: (index: number) => void;
      next: () => void;
      gems: () => number;
      coat: () => string;
      name: () => string;
    };
  }
}

const DIRS: { dir: Dir; label: string; icon: typeof ArrowUp }[] = [
  { dir: "L", label: "Move left", icon: ArrowLeft },
  { dir: "U", label: "Move up", icon: ArrowUp },
  { dir: "D", label: "Move down", icon: ArrowDown },
  { dir: "R", label: "Move right", icon: ArrowRight },
];

function keyDir(code: string): Dir | null {
  if (code === "ArrowLeft" || code === "KeyA") return "L";
  if (code === "ArrowRight" || code === "KeyD") return "R";
  if (code === "ArrowUp" || code === "KeyW") return "U";
  if (code === "ArrowDown" || code === "KeyS") return "D";
  return null;
}

export function LacquerGame() {
  const [mode, setMode] = useState<"title" | "play">("title");
  const [hud, setHud] = useState<Hud | null>(null);
  const [best, setBest] = useState<Record<string, Best>>({});
  const [muted, setMuted] = useState(false);
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [square, setSquare] = useState(280);
  const [winStars, setWinStars] = useState<1 | 2 | 3 | null>(null);
  const [gems, setGems] = useState(0);
  const [ownedCoats, setOwnedCoats] = useState<string[]>([DEFAULT_COAT]);
  const [ownedBoards, setOwnedBoards] = useState<string[]>([DEFAULT_BOARD]);
  const [ownedPieces, setOwnedPieces] = useState<string[]>([DEFAULT_PIECE]);
  const [ownedFrames, setOwnedFrames] = useState<string[]>([DEFAULT_FRAME]);
  const [coatId, setCoatId] = useState(DEFAULT_COAT);
  const [boardId, setBoardId] = useState(DEFAULT_BOARD);
  const [pieceId, setPieceId] = useState(DEFAULT_PIECE);
  const [frameId, setFrameId] = useState(DEFAULT_FRAME);
  const [storeOpen, setStoreOpen] = useState(false);
  const [storeTab, setStoreTab] = useState<"lacquer" | "board" | "piece" | "frame">("lacquer");
  const [gemGain, setGemGain] = useState(0);
  const simRef = useRef<Session | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const meterRef = useRef<HTMLDivElement | null>(null);
  const modeRef = useRef(mode);
  const sizeRef = useRef(square);
  const boardsRef = useRef(boardsOpen);
  const storeRef = useRef(storeOpen);
  const bestRef = useRef(best);
  const mutedRef = useRef(muted);
  const gemsRef = useRef(gems);
  const ownedCoatsRef = useRef(ownedCoats);
  const ownedBoardsRef = useRef(ownedBoards);
  const ownedPiecesRef = useRef(ownedPieces);
  const ownedFramesRef = useRef(ownedFrames);
  const coatRef = useRef(coatId);
  const boardRef = useRef(boardId);
  const pieceRef = useRef(pieceId);
  const frameRef = useRef(frameId);
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);

  modeRef.current = mode;
  sizeRef.current = square;
  boardsRef.current = boardsOpen;
  storeRef.current = storeOpen;
  bestRef.current = best;
  mutedRef.current = muted;
  gemsRef.current = gems;
  ownedCoatsRef.current = ownedCoats;
  ownedBoardsRef.current = ownedBoards;
  ownedPiecesRef.current = ownedPieces;
  ownedFramesRef.current = ownedFrames;
  coatRef.current = coatId;
  boardRef.current = boardId;
  pieceRef.current = pieceId;
  frameRef.current = frameId;

  function saveNow() {
    const sim = simRef.current;
    const save: Save = {
      v: 3,
      level: sim?.levelIndex ?? 0,
      best: bestRef.current,
      muted: mutedRef.current,
      gems: gemsRef.current,
      coat: coatRef.current,
      ownedCoats: ownedCoatsRef.current,
      board: boardRef.current,
      ownedBoards: ownedBoardsRef.current,
      piece: pieceRef.current,
      ownedPieces: ownedPiecesRef.current,
      frame: frameRef.current,
      ownedFrames: ownedFramesRef.current,
      run: sim?.run ?? 0,
    };
    writeSave(save);
  }

  useEffect(() => {
    const save = loadSave();
    setBest(save.best);
    setMuted(save.muted);
    setGems(save.gems);
    setOwnedCoats(save.ownedCoats);
    setOwnedBoards(save.ownedBoards);
    setOwnedPieces(save.ownedPieces);
    setOwnedFrames(save.ownedFrames);
    setCoatId(save.coat);
    setBoardId(save.board);
    setPieceId(save.piece);
    setFrameId(save.frame);
    setAudioMuted(save.muted);
    bestRef.current = save.best;
    mutedRef.current = save.muted;
    gemsRef.current = save.gems;
    ownedCoatsRef.current = save.ownedCoats;
    ownedBoardsRef.current = save.ownedBoards;
    ownedPiecesRef.current = save.ownedPieces;
    ownedFramesRef.current = save.ownedFrames;
    coatRef.current = save.coat;
    boardRef.current = save.board;
    pieceRef.current = save.piece;
    frameRef.current = save.frame;

    const sim = new Session(
      (next) => setHud(next),
      (stars) => {
        const id = sim.level.id;
        const prev = bestRef.current[id];
        const prevStars = prev?.stars ?? 0;
        const gain = Math.max(0, stars - prevStars);
        if (gain > 0) {
          gemsRef.current += gain;
          setGems(gemsRef.current);
        }
        setGemGain(gain);
        let nextBest = bestRef.current;
        if (!prev || stars > prev.stars || (stars === prev.stars && sim.moves < prev.moves)) {
          nextBest = { ...bestRef.current, [id]: { moves: sim.moves, stars } };
          bestRef.current = nextBest;
          setBest(nextBest);
        }
        saveNow();
        setWinStars(stars);
      },
    );
    sim.coatId = save.coat;
    sim.pieceId = save.piece;
    sim.material = materialById(save.board);
    sim.run = save.run;
    simRef.current = sim;
    sim.publish();

    window.__lacquer = {
      ready: true,
      swipe: (dir) => sim.swipe(dir),
      phase: () => (modeRef.current === "title" ? "title" : sim.phase),
      row: () => sim.r,
      col: () => sim.c,
      coated: () => sim.hud().coated,
      total: () => sim.hud().total,
      moves: () => sim.moves,
      load: (index) => {
        sim.load(index, false);
        setMode("play");
        setBoardsOpen(false);
        setStoreOpen(false);
      },
      next: () => {
        sim.nextCast();
        setMode("play");
        setBoardsOpen(false);
        setStoreOpen(false);
      },
      gems: () => gemsRef.current,
      coat: () => sim.coatId,
      name: () => sim.level.name,
    };

    const slot = slotRef.current;
    const observer = new ResizeObserver(() => {
      if (!slot) return;
      const rect = slot.getBoundingClientRect();
      const side = Math.floor(Math.min(rect.width, rect.height));
      if (side > 40) setSquare((prev) => (prev === side ? prev : side));
    });
    if (slot) observer.observe(slot);

    const onKey = (event: KeyboardEvent) => {
      if (boardsRef.current || storeRef.current) {
        if (event.code === "Escape") {
          setBoardsOpen(false);
          setStoreOpen(false);
        }
        return;
      }
      if (event.repeat) return;
      const dir = keyDir(event.code);
      if (dir || event.code === "KeyZ" || event.code === "Backspace" || event.code === "KeyR") {
        event.preventDefault();
      }
      if (!simRef.current) return;
      unlockAudio();
      if (dir && modeRef.current === "title") {
        simRef.current.nextCast();
        setMode("play");
        simRef.current.swipe(dir);
        saveNow();
        return;
      }
      if (dir) simRef.current.swipe(dir);
      else if (event.code === "KeyZ" || event.code === "Backspace") simRef.current.undo();
      else if (event.code === "KeyR") simRef.current.reset();
    };

    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sim.update(dt);
      const canvas = canvasRef.current;
      if (canvas) {
        const size = Math.floor(canvas.clientWidth);
        if (size > 40) {
        const dpr = Math.min(2.5, window.devicePixelRatio || 1);
        const px = Math.round(size * dpr);
        if (canvas.width !== px) {
          canvas.width = px;
          canvas.height = px;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawBoard(
            ctx,
            {
              grid: sim.grid,
              painted: sim.painted,
              wet: sim.wet,
              ballX: sim.ballX,
              ballY: sim.ballY,
              ballRot: sim.ballRot,
              squashX: sim.squashX,
              squashY: sim.squashY,
              particles: sim.particles,
              trauma: sim.trauma,
              hint: sim.hint,
              hintLife: sim.hintLife,
              material: sim.material,
              coatId: sim.coatId,
              pieceId: sim.pieceId,
              stride: sim.stride,
            },
            size,
            now / 1000,
          );
          if (meterRef.current) meterRef.current.style.background = coatFillCss(sim.coatId, now / 1000);
        }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      delete window.__lacquer;
    };
  }, []);

  useEffect(() => {
    if (hud?.phase !== "won") {
      setWinStars(null);
      setGemGain(0);
    }
  }, [hud?.phase]);

  function begin(index: number) {
    unlockAudio();
    sfx.ui();
    simRef.current?.load(index, false);
    setMode("play");
    setBoardsOpen(false);
    setStoreOpen(false);
    saveNow();
  }

  function beginNext() {
    unlockAudio();
    sfx.ui();
    simRef.current?.nextCast();
    setMode("play");
    setBoardsOpen(false);
    setStoreOpen(false);
    setWinStars(null);
    saveNow();
  }

  function equip(
    id: string,
    price: number,
    ownedRef: { current: string[] },
    setOwned: (ids: string[]) => void,
    currentRef: { current: string },
    setCurrent: (id: string) => void,
    apply: (id: string) => void,
  ) {
    unlockAudio();
    const have = ownedRef.current.includes(id);
    if (!have) {
      if (gemsRef.current < price) return;
      gemsRef.current -= price;
      ownedRef.current = [...ownedRef.current, id];
      setGems(gemsRef.current);
      setOwned(ownedRef.current);
    }
    currentRef.current = id;
    setCurrent(id);
    apply(id);
    sfx.ui();
    saveNow();
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 24) return;
    if (modeRef.current === "title") return;
    unlockAudio();
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : dy > 0 ? "D" : "U";
    simRef.current?.swipe(dir);
  }

  function toggleMute() {
    unlockAudio();
    setMuted((prev) => {
      const next = !prev;
      setAudioMuted(next);
      mutedRef.current = next;
      saveNow();
      return next;
    });
  }

  const showWin = mode === "play" && hud?.phase === "won" && winStars;
  const showStuck = mode === "play" && hud?.phase === "stuck";
  const coach =
    mode === "play" &&
    hud?.moves === 0 &&
    hud.phase === "idle" &&
    ((hud.endless && hud.levelIndex === 1) || (!hud.endless && hud.levelIndex === 0));

  return (
    <main className="relative flex h-dvh flex-col">
      <header className="safe-top flex shrink-0 items-center justify-between gap-3 px-4 pb-2">
        <div>
          <p className="font-display text-2xl leading-none font-semibold tracking-tight text-cream">Lacquer</p>
          {mode === "title" ? (
            <p className="mt-1 max-w-xs text-sm leading-snug text-muted">
              {pieceId === "marble"
                ? "Roll until the marble hits a wall. Stars pay gems."
                : "Slide until it hits a wall. Stars pay gems."}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">
              {hud
                ? `${hud.material} · ${hud.moves} ${
                    pieceId === "marble"
                      ? hud.moves === 1
                        ? "roll"
                        : "rolls"
                      : hud.moves === 1
                        ? "move"
                        : "moves"
                  } · par ${hud.par}`
                : "—"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="press inline-flex h-11 items-center gap-1.5 rounded-full bg-surface px-3 text-sm font-medium text-fg"
            onClick={() => {
              unlockAudio();
              setBoardsOpen(false);
              setStoreOpen(true);
            }}
            aria-label={`Store, ${gems} gems`}
          >
            <Gem className="size-4" />
            {gems}
          </button>
          <button
            type="button"
            className="press inline-flex size-11 items-center justify-center rounded-full bg-surface text-fg"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
        </div>
      </header>

      <div ref={slotRef} className="relative flex min-h-0 flex-1 items-center justify-center px-4">
        <div className="board-shadow relative rounded-2xl" style={{ width: square, height: square }}>
          <div className="absolute inset-0 rounded-2xl" style={{ background: frameById(frameId).background }} />
          <div className="absolute inset-5 overflow-hidden rounded-xl">
          <canvas ref={canvasRef} className="h-full w-full touch-none" />
          <div
            className="absolute inset-0 touch-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              gesture.current = null;
            }}
          />
          </div>
          <p className="board-pill pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-2xl bg-cream px-4 py-1.5 text-base font-semibold text-ink shadow-lg">
            {hud?.name ?? "Impossible"}
          </p>
          {coach ? (
            <p className="pointer-events-none absolute inset-x-4 top-4 rounded-xl bg-ink/80 px-3 py-2 text-center text-sm leading-snug text-cream">
              Swipe, or press an arrow. {pieceId === "marble" ? "The marble only stops when it hits a wall." : "It only stops when it hits a wall."}
            </p>
          ) : null}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {hud
          ? `${hud.name}, ${hud.material}. ${hud.coated} of ${hud.total} grooves coated. ${hud.phase === "won" ? "Board finished." : hud.phase === "stuck" ? "No way to finish from here." : ""}`
          : "Lacquer"}
      </p>

      <footer className="safe-pad shrink-0 px-4 pt-3">
        {mode === "title" ? (
          <div className="mx-auto flex w-full max-w-md flex-col gap-2">
            <button
              type="button"
              className="press h-12 rounded-full bg-cream text-base font-semibold text-ink"
              onClick={() => beginNext()}
            >
              Play
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="press h-11 rounded-full bg-surface text-sm font-medium text-fg"
                onClick={() => begin(LEVELS.length - 1)}
              >
                Try Impossible
              </button>
              <button
                type="button"
                className="press h-11 rounded-full bg-surface text-sm font-medium text-fg"
                onClick={() => {
                  unlockAudio();
                  setStoreOpen(false);
                  setBoardsOpen(true);
                }}
              >
                All boards
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted">
                <span>
                  {hud ? `${hud.coated} / ${hud.total} coated` : "Coated"}
                </span>
                <span>{hud ? `${hud.difficulty} · ${hud.material}` : ""}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  ref={meterRef}
                  className="h-full rounded-full bg-paint"
                  style={{ width: hud && hud.total ? `${(hud.coated / hud.total) * 100}%` : "0%" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DIRS.map(({ dir, label, icon: Icon }) => (
                <button
                  key={dir}
                  type="button"
                  aria-label={label}
                  className="press inline-flex h-11 items-center justify-center rounded-xl bg-surface text-fg"
                  onClick={() => {
                    unlockAudio();
                    simRef.current?.swipe(dir);
                  }}
                >
                  <Icon className="size-5" />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                aria-label="Undo"
                className="press inline-flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl bg-surface text-xs text-fg disabled:opacity-40"
                onClick={() => simRef.current?.undo()}
                disabled={!hud?.canUndo}
              >
                <Undo2 className="size-4" />
                Undo
              </button>
              <button
                type="button"
                aria-label="Reset board"
                className="press inline-flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl bg-surface text-xs text-fg"
                onClick={() => simRef.current?.reset()}
              >
                <RotateCcw className="size-4" />
                Reset
              </button>
              <button
                type="button"
                aria-label="All boards"
                className="press inline-flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl bg-surface text-xs text-fg"
                onClick={() => {
                  unlockAudio();
                  setStoreOpen(false);
                  setBoardsOpen(true);
                }}
              >
                <LayoutGrid className="size-4" />
                Boards
              </button>
              <button
                type="button"
                aria-label="Nudge, shows a roll and caps stars at two"
                className="press inline-flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl bg-surface text-xs text-fg disabled:opacity-40"
                onClick={() => simRef.current?.nudge()}
                disabled={hud?.phase === "rolling" || hud?.phase === "won"}
              >
                <Lightbulb className="size-4" />
                Nudge
              </button>
            </div>
          </div>
        )}
      </footer>

      {showStuck ? (
        <p className="pointer-events-none absolute inset-x-4 bottom-28 rounded-2xl bg-cream px-4 py-3 text-center text-sm text-ink">
          Sealed in. This coat can’t be finished from here. Undo, or reset the board.
        </p>
      ) : null}

      {showWin ? (
        <div className="absolute inset-0 flex items-end justify-center bg-ink/50 px-4 pb-6 sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-cream p-5 text-ink">
            <p className="font-display text-3xl font-semibold">Fully coated</p>
            <p className="mt-1 text-sm text-ink/70">
              {hud?.name} · {hud?.moves} {hud?.moves === 1 ? "roll" : "rolls"}
              {hud && hud.moves <= hud.par ? " · on par" : ""}
              {hud?.assisted ? " · guided, two stars at best" : ""}
            </p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={n <= (winStars ?? 0) ? "size-6 fill-paint text-paint" : "size-6 text-ink/25"}
                />
              ))}
            </div>
            {gemGain > 0 ? (
              <p className="mt-3 text-sm font-medium">
                +{gemGain} {gemGain === 1 ? "gem" : "gems"}
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="press h-11 rounded-full bg-ink/10 text-sm font-medium"
                onClick={() => simRef.current?.reset()}
              >
                Replay
              </button>
              <button
                type="button"
                className="press h-11 rounded-full bg-ink text-sm font-semibold text-cream"
                onClick={() => beginNext()}
              >
                Next level
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {boardsOpen ? (
        <div
          className="absolute inset-0 z-20 flex items-end justify-center bg-ink/60 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Boards"
          onClick={() => setBoardsOpen(false)}
        >
          <div
            className="max-h-[86dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-bg px-4 pt-4 pb-6 sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Boards</h2>
              <button
                type="button"
                className="press inline-flex size-11 items-center justify-center rounded-full bg-surface"
                onClick={() => setBoardsOpen(false)}
                aria-label="Close boards"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LEVELS.map((level, index) => {
                const record = best[level.id];
                return (
                  <button
                    key={level.id}
                    type="button"
                    className="press rounded-2xl bg-surface p-3 text-left"
                    onClick={() => begin(index)}
                  >
                    <Thumb rows={level.rows} wall={materialById(boardId).swatch} />
                    <span className="mt-2 block text-sm font-medium text-fg">{level.name}</span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted">
                      <span className="min-w-0 truncate">{level.difficulty}</span>
                      <span className="inline-flex shrink-0">
                        {[1, 2, 3].map((n) => (
                          <Star
                            key={n}
                            className={
                              record && n <= record.stars
                                ? "size-3.5 fill-paint text-paint"
                                : "size-3.5 text-line"
                            }
                          />
                        ))}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {storeOpen ? (
        <div
          className="absolute inset-0 z-20 flex items-end justify-center bg-ink/60 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Store"
          onClick={() => setStoreOpen(false)}
        >
          <div
            className="max-h-[86dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-bg px-4 pt-4 pb-6 sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Store</h2>
              <button
                type="button"
                className="press inline-flex size-11 items-center justify-center rounded-full bg-surface"
                onClick={() => setStoreOpen(false)}
                aria-label="Close store"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mb-3 text-sm text-muted">
              {gems} {gems === 1 ? "gem" : "gems"}. Lacquer, boards, pieces, and cloth borders.
            </p>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {(
                [
                  ["lacquer", "Lacquer"],
                  ["board", "Board"],
                  ["piece", "Piece"],
                  ["frame", "Frame"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={
                    storeTab === id
                      ? "press h-11 rounded-full bg-cream text-xs font-semibold text-ink"
                      : "press h-11 rounded-full bg-surface text-xs font-medium text-fg"
                  }
                  onClick={() => setStoreTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <ul className="flex flex-col gap-2">
              {storeTab === "lacquer"
                ? COATS.map((coat) => (
                    <ShopRow
                      key={coat.id}
                      name={coat.name}
                      detail={coat.detail}
                      swatch={
                        coat.motion === "rainbow"
                          ? { background: "conic-gradient(#d64545, #d6a345, #3dae62, #3a6fd6, #8a45d6, #d64545)" }
                          : { backgroundColor: coatSwatch(coat) }
                      }
                      owned={ownedCoats.includes(coat.id)}
                      wearing={coatId === coat.id}
                      price={coat.price}
                      gems={gems}
                      onBuy={() =>
                        equip(coat.id, coat.price, ownedCoatsRef, setOwnedCoats, coatRef, setCoatId, (id) => {
                          if (simRef.current) simRef.current.coatId = id;
                        })
                      }
                    />
                  ))
                : null}
              {storeTab === "board"
                ? SHOP_BOARDS.map((item) => {
                    const material = materialById(item.id);
                    return (
                      <ShopRow
                        key={item.id}
                        name={material.name}
                        detail={item.detail}
                        swatch={{ backgroundColor: material.swatch }}
                        owned={ownedBoards.includes(item.id)}
                        wearing={boardId === item.id}
                        price={item.price}
                        gems={gems}
                        onBuy={() =>
                          equip(item.id, item.price, ownedBoardsRef, setOwnedBoards, boardRef, setBoardId, (id) => {
                            if (simRef.current) simRef.current.material = materialById(id);
                          })
                        }
                      />
                    );
                  })
                : null}
              {storeTab === "piece"
                ? PIECES.map((piece) => (
                    <ShopRow
                      key={piece.id}
                      name={piece.name}
                      detail={piece.detail}
                      swatch={pieceSwatch(piece.kind)}
                      owned={ownedPieces.includes(piece.id)}
                      wearing={pieceId === piece.id}
                      price={piece.price}
                      gems={gems}
                      onBuy={() =>
                        equip(piece.id, piece.price, ownedPiecesRef, setOwnedPieces, pieceRef, setPieceId, (id) => {
                          if (simRef.current) simRef.current.pieceId = id;
                        })
                      }
                    />
                  ))
                : null}
              {storeTab === "frame"
                ? FRAMES.map((frame) => (
                    <ShopRow
                      key={frame.id}
                      name={frame.name}
                      detail={frame.detail}
                      swatch={{ background: frame.background, backgroundColor: frame.swatch }}
                      owned={ownedFrames.includes(frame.id)}
                      wearing={frameId === frame.id}
                      price={frame.price}
                      gems={gems}
                      onBuy={() => equip(frame.id, frame.price, ownedFramesRef, setOwnedFrames, frameRef, setFrameId, () => {})}
                    />
                  ))
                : null}
            </ul>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function pieceSwatch(kind: string): CSSProperties {
  if (kind === "cube") return { background: "linear-gradient(135deg, #9eb6ff 0 48%, #1e3ae0 48% 100%)" };
  if (kind === "pyramid") return { background: "linear-gradient(160deg, #d7e2ff 0 38%, #1e3ae0 38% 100%)" };
  if (kind === "marble") return { background: "radial-gradient(circle at 35% 30%, #e8eeff, #2c4ae8 48%, #10206a)" };
  return { backgroundColor: "#f4efe4" };
}

function ShopRow({
  name,
  detail,
  swatch,
  owned,
  wearing,
  price,
  gems,
  onBuy,
}: {
  name: string;
  detail: string;
  swatch: CSSProperties;
  owned: boolean;
  wearing: boolean;
  price: number;
  gems: number;
  onBuy: () => void;
}) {
  const label = wearing ? "Wearing" : owned ? "Wear" : price === 0 ? "Free" : `${price} gems`;
  const disabled = wearing || (!owned && gems < price);
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface p-2">
      <span className="size-11 shrink-0 rounded-xl border border-line" style={swatch} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{name}</span>
        <span className="block truncate text-xs text-muted">{detail}</span>
      </span>
      <button
        type="button"
        className="press h-11 shrink-0 rounded-full bg-cream px-3 text-sm font-semibold whitespace-nowrap text-ink disabled:opacity-45"
        disabled={disabled}
        onClick={onBuy}
      >
        {label}
      </button>
    </li>
  );
}

function Thumb({ rows, wall }: { rows: string[]; wall: string }) {
  const cols = rows[0]?.length ?? 1;
  return (
    <div
      className="grid w-full gap-px rounded-lg bg-ink p-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {rows.flatMap((row, r) =>
        row.split("").map((ch, c) => (
          <span
            key={`${r}-${c}`}
            className={ch === "@" ? "aspect-square bg-cream" : ch === "#" ? "aspect-square" : "aspect-square bg-paint"}
            style={ch === "#" ? { backgroundColor: wall } : undefined}
          />
        )),
      )}
    </div>
  );
}
