"use client";

const STORAGE_KEY = "financehub:slider-sound";

let audioCtx: AudioContext | null = null;
let enabled = true;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null) enabled = stored === "1";
}

export function isSoundEnabled(): boolean {
  hydrate();
  return enabled;
}

export function setSoundEnabled(value: boolean) {
  hydrate();
  enabled = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  }
  listeners.forEach((listener) => listener());
}

export function subscribeSoundEnabled(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

/**
 * Short synthesized tick, pitch-shifted by `intensity` (0..1) so dragging a
 * slider up produces a rising tone — mirrors a physical dial, not a beep.
 */
export function playTick(intensity: number) {
  hydrate();
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const clamped = Math.min(1, Math.max(0, intensity));
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(620 + clamped * 780, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.05, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}
