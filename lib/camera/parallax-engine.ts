/**
 * CameraEngine — single owner of camera state.
 *
 * Replaces the direct-write ParallaxLayer with a target/current LERP
 * loop running on a single requestAnimationFrame. Mouse position sets
 * the TARGET; the engine LERPs the CURRENT toward it each frame.
 *
 * Composes:
 *   target          ← mouse (or programmatic)
 *   idleDrift       ← sin/cos micro-motion when mouse hasn't moved >2s
 *   impulse         ← clash-punch (decays fast)
 *   shake           ← screen shake (decays + jitters)
 *
 * Output (written to <html> root each frame):
 *   --parallax-x          : px (deepest layer travel)
 *   --parallax-y          : px
 *   --parallax-arena-x    : px (mid layer, 0.5×)
 *   --parallax-arena-y    : px
 *   --parallax-card-y     : px (foreground, 0.2×)
 *   --camera-shake-x      : px
 *   --camera-shake-y      : px
 *
 * Tunable via `engine.config` (mutable, exposed for Tweakpane bindings).
 */

import type { Element } from "@/lib/honeycomb/wuxing";

/** Public, mutable knobs. Tweakpane binds to this object. */
export interface CameraConfig {
  /** LERP factor 0.05..0.30 — higher = snappier, lower = lazier. */
  smoothing: number;
  /** Max travel for deepest layer (px). */
  maxTravelPx: number;
  /** Idle drift enabled (subtle sin-wave when target settled). */
  idleDriftEnabled: boolean;
  /** Idle drift amplitude factor (0..1, multiplied by maxTravelPx). */
  idleDriftAmp: number;
  /** Idle drift period in seconds (one full cycle). */
  idleDriftPeriodSec: number;
  /** Idle drift triggers after this many ms of mouse stillness. */
  idleDriftDelayMs: number;
  /** Punch impulse decay rate per frame (0..1). */
  punchDecay: number;
  /** Shake decay per frame (0..1). */
  shakeDecay: number;
  /** Shake jitter scale — multiplied by shake intensity each frame. */
  shakeJitterPx: number;
  /** Layer depth multipliers. */
  arenaDepth: number;
  cardDepth: number;
}

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  smoothing: 0.12,
  maxTravelPx: 6,
  idleDriftEnabled: true,
  idleDriftAmp: 0.35,
  idleDriftPeriodSec: 9,
  idleDriftDelayMs: 1500,
  punchDecay: 0.18,
  shakeDecay: 0.14,
  shakeJitterPx: 8,
  arenaDepth: 0.5,
  cardDepth: 0.2,
};

interface CameraState {
  // Normalized -1..+1 (multiplied by maxTravelPx for output)
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  // Impulse decays each frame (additive)
  impulseX: number;
  impulseY: number;
  // Shake intensity 0..1, decays each frame
  shake: number;
  // Tracking
  lastMouseMoveAt: number;
  birthMs: number;
}

class CameraEngine {
  readonly config: CameraConfig = { ...DEFAULT_CAMERA_CONFIG };
  private state: CameraState;
  private rafId: number | null = null;
  private root: HTMLElement | null = null;
  private listeners: Set<() => void> = new Set();
  private running = false;

  constructor() {
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    this.state = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      impulseX: 0,
      impulseY: 0,
      shake: 0,
      lastMouseMoveAt: now,
      birthMs: now,
    };
  }

  /** Start the RAF loop. Idempotent. */
  start(root?: HTMLElement) {
    if (this.running) return;
    if (typeof window === "undefined") return;
    this.root = root ?? document.documentElement;
    this.running = true;
    this.tick();
  }

  /** Stop the RAF loop and zero out CSS vars. */
  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.zeroOut();
  }

  /** Set normalized target (-1..+1). Caller responsible for normalization. */
  setTarget(x: number, y: number) {
    this.state.targetX = clamp(-1, 1, x);
    this.state.targetY = clamp(-1, 1, y);
    this.state.lastMouseMoveAt = performance.now();
    this.notify();
  }

  /** Brief impulse (e.g., clash punch). Magnitude in normalized units. */
  punch(magnitudeX: number, magnitudeY: number) {
    this.state.impulseX += magnitudeX;
    this.state.impulseY += magnitudeY;
    this.notify();
  }

  /** Add screen shake. Intensity 0..1. Decays each frame. */
  shake(intensity: number) {
    this.state.shake = Math.min(1, this.state.shake + intensity);
    this.notify();
  }

  /** Snapshot of current state (for monitor bindings). */
  readState(): Readonly<CameraState> {
    return this.state;
  }

  /** Subscribe to state changes (for tweakpane monitor bindings). */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }

  private tick = () => {
    if (!this.running) return;
    const now = performance.now();
    const cfg = this.config;

    // Idle drift
    let driftX = 0;
    let driftY = 0;
    const sinceMove = now - this.state.lastMouseMoveAt;
    if (cfg.idleDriftEnabled && sinceMove > cfg.idleDriftDelayMs) {
      const t = (now - this.state.birthMs) / 1000;
      const omega = (Math.PI * 2) / cfg.idleDriftPeriodSec;
      driftX = Math.sin(t * omega) * cfg.idleDriftAmp;
      driftY = Math.cos(t * omega * 0.7) * cfg.idleDriftAmp;
    }

    // Composite target = pointer + drift + impulse
    const compositeX = this.state.targetX + driftX + this.state.impulseX;
    const compositeY = this.state.targetY + driftY + this.state.impulseY;

    // LERP current toward composite
    this.state.currentX = lerp(this.state.currentX, compositeX, cfg.smoothing);
    this.state.currentY = lerp(this.state.currentY, compositeY, cfg.smoothing);

    // Decay impulse + shake
    this.state.impulseX *= 1 - cfg.punchDecay;
    this.state.impulseY *= 1 - cfg.punchDecay;
    if (Math.abs(this.state.impulseX) < 0.0005) this.state.impulseX = 0;
    if (Math.abs(this.state.impulseY) < 0.0005) this.state.impulseY = 0;
    this.state.shake *= 1 - cfg.shakeDecay;
    if (this.state.shake < 0.005) this.state.shake = 0;

    // Write CSS vars on this.root (default <html>)
    if (this.root) {
      const px = this.state.currentX * cfg.maxTravelPx;
      const py = this.state.currentY * cfg.maxTravelPx;
      this.root.style.setProperty("--parallax-x", `${px.toFixed(2)}px`);
      this.root.style.setProperty("--parallax-y", `${py.toFixed(2)}px`);
      this.root.style.setProperty(
        "--parallax-arena-x",
        `${(px * cfg.arenaDepth).toFixed(2)}px`,
      );
      this.root.style.setProperty(
        "--parallax-arena-y",
        `${(py * cfg.arenaDepth).toFixed(2)}px`,
      );
      this.root.style.setProperty(
        "--parallax-card-y",
        `${(py * cfg.cardDepth).toFixed(2)}px`,
      );
      // Shake — pseudo-random jitter scaled by current shake intensity
      const jx = (Math.random() - 0.5) * 2 * this.state.shake * cfg.shakeJitterPx;
      const jy = (Math.random() - 0.5) * 2 * this.state.shake * cfg.shakeJitterPx;
      this.root.style.setProperty("--camera-shake-x", `${jx.toFixed(2)}px`);
      this.root.style.setProperty("--camera-shake-y", `${jy.toFixed(2)}px`);
    }

    this.notify();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private zeroOut() {
    if (!this.root) return;
    for (const v of [
      "--parallax-x",
      "--parallax-y",
      "--parallax-arena-x",
      "--parallax-arena-y",
      "--parallax-card-y",
      "--camera-shake-x",
      "--camera-shake-y",
    ]) {
      this.root.style.setProperty(v, "0px");
    }
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function clamp(min: number, max: number, n: number): number {
  return n < min ? min : n > max ? max : n;
}

// ─── Singleton ──────────────────────────────────────────────────
let _instance: CameraEngine | null = null;
export function cameraEngine(): CameraEngine {
  if (!_instance) _instance = new CameraEngine();
  return _instance;
}

// ─── Convenience: per-element clash punch presets ───────────────
export function punchForElement(element: Element): { x: number; y: number; shake: number } {
  switch (element) {
    case "fire":
      return { x: 0, y: -0.18, shake: 0.5 }; // upward jolt + medium shake
    case "earth":
      return { x: 0, y: 0.08, shake: 0.85 }; // downward + heavy shake
    case "metal":
      return { x: 0.12, y: -0.05, shake: 0.4 }; // sideways slash
    case "wood":
      return { x: 0, y: -0.05, shake: 0.15 }; // gentle bloom
    case "water":
      return { x: 0, y: 0.05, shake: 0.25 }; // ripple-down
  }
}
