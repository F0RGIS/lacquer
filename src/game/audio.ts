let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let muted = false;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 0.25);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

export function unlockAudio(): void {
  const ac = context();
  if (ac && ac.state === "suspended") void ac.resume();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (!master || !ctx) return;
  master.gain.setTargetAtTime(next ? 0.0001 : 0.9, ctx.currentTime, 0.02);
}

export function resumeAudio(): void {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number): void {
  const ac = context();
  if (!ac || !master || muted) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}

function thud(): void {
  const ac = context();
  if (!ac || !master || !noise || muted) return;
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noise;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(420, t);
  filter.frequency.exponentialRampToValueAtTime(120, t + 0.12);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  src.connect(filter);
  filter.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + 0.16);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    g.disconnect();
  };
}

export const sfx = {
  bump() {
    tone(180 + Math.random() * 30, 0.05, "triangle", 0.03);
  },
  tick() {
    tone(240 + Math.random() * 50, 0.045, "sine", 0.028, 180);
  },
  hit() {
    thud();
    tone(96 + Math.random() * 16, 0.09, "sine", 0.07, 70);
  },
  paint() {
    tone(560 + Math.random() * 90, 0.07, "sine", 0.03, 820);
  },
  stuck() {
    tone(160, 0.22, "triangle", 0.05, 70);
  },
  ui() {
    tone(620, 0.04, "sine", 0.03);
  },
  win() {
    [523, 659, 784, 1046].forEach((freq, i) => {
      window.setTimeout(() => tone(freq, 0.2, "triangle", 0.06), i * 95);
    });
  },
};
