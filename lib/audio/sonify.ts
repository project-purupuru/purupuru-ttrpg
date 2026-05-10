/**
 * WuxingSonifier — Hatnote-style ambient sonification of the activity stream.
 *
 * Pure Web Audio API (no library). Each activity event becomes a soft
 * pentatonic tone whose pitch is determined by the event's element and
 * whose voice envelope is shaped by the action kind. Pentatonic guarantees
 * harmony at any polyphony level — multiple simultaneous events read as
 * a chord, not noise.
 *
 * Defenses against rapid-fire stacking (per dig 2026-05-08 §2 Listen to
 * Wikipedia + game-audio canonical patterns):
 *   1. Per-element cooldown (450ms) — same element can't retrigger
 *   2. Polyphony cap (6 voices) — oldest cut when 7th would start
 *   3. Long reverb tail (~1.8s) — sequential notes blend into wash
 *   4. Master compressor — catches any remaining peaks
 *
 * AudioContext starts SUSPENDED on construction (browser autoplay policy
 * requires a user-gesture-triggered resume). Caller's `start()` after a
 * click is what actually un-suspends and routes audio.
 */

import type { Element } from "@/lib/score";

// Major-pentatonic in C — peaceful at any polyphony, no half-steps to clash.
// Order chosen so adjacent wuxing elements (生 cycle) sit ~3rd apart, which
// reads as motion when events flow around the cycle.
const ELEMENT_FREQ_HZ: Record<Element, number> = {
  wood: 523.25,   // C5
  fire: 587.33,   // D5
  earth: 659.25,  // E5
  metal: 783.99,  // G5
  water: 880.00,  // A5
};

const COOLDOWN_MS = 450;
const POLYPHONY = 6;
const MASTER_GAIN = 0.28;
const REVERB_SECONDS = 1.8;

export interface PlayEventOpts {
  element: Element;
  kind: "join";
  /** 0..1, scales final voice gain. Defaults to 0.6. */
  velocity?: number;
}

interface VoiceShape {
  type: OscillatorType;
  octaveMul: number;
  attackS: number;
  decayS: number;
  gainPeak: number;
}

const VOICE_BY_KIND: Record<PlayEventOpts["kind"], VoiceShape> = {
  // Warm chime — sine, base octave, soft attack, long decay. The "discovery
  // glow" voice from the previous quiz_completed shape — fits a new clan
  // member emerging.
  join: { type: "sine", octaveMul: 1, attackS: 0.030, decayS: 1.00, gainPeak: 0.50 },
};

export class WuxingSonifier {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private convolver: ConvolverNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private lastNoteAt: Record<Element, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  };
  private activeVoices: Set<OscillatorNode> = new Set();
  private enabled = false;

  /** Resume the AudioContext (creating the graph on first call). MUST be
   * invoked from a user-gesture handler — browser autoplay rules. */
  async start(): Promise<void> {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) {
        // Browser without Web Audio (very rare in 2026) — silently no-op.
        return;
      }
      this.ctx = new Ctor();
      this.setupGraph();
    }
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    this.enabled = true;
  }

  /** Suspend the graph so re-enable is instant. Doesn't tear down. */
  stop(): void {
    this.enabled = false;
    if (this.ctx && this.ctx.state === "running") {
      // Best-effort suspend; ignore if the browser refuses (some
      // platforms reject suspend() during pending operations).
      this.ctx.suspend().catch(() => {});
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private setupGraph(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = MASTER_GAIN;

    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.25;

    // Procedural reverb — exponential-decay white-noise impulse. Cheap,
    // sounds plausibly "small room" at this length. No external IR file
    // needed (zero bundle cost).
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.makeReverbImpulse(REVERB_SECONDS);

    this.wetGain = ctx.createGain();
    this.wetGain.gain.value = 0.40;
    this.dryGain = ctx.createGain();
    this.dryGain.gain.value = 0.55;

    // Voices → masterGain → split into dry + convolver(→ wet) → compressor → out
    this.masterGain.connect(this.dryGain);
    this.masterGain.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.dryGain.connect(this.compressor);
    this.wetGain.connect(this.compressor);
    this.compressor.connect(ctx.destination);
  }

  private makeReverbImpulse(seconds: number): AudioBuffer {
    const ctx = this.ctx;
    if (!ctx) throw new Error("AudioContext not initialized");
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // (1-t)^2.5 ≈ smooth exp-ish decay; sounds warmer than pure exp.
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.5);
      }
    }
    return buf;
  }

  play(opts: PlayEventOpts): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const nowMs = ctx.currentTime * 1000;

    // Per-element cooldown — collapses repeat-element bursts into one note.
    if (nowMs - this.lastNoteAt[opts.element] < COOLDOWN_MS) return;
    this.lastNoteAt[opts.element] = nowMs;

    // Polyphony cap — voice steal from oldest if at limit.
    while (this.activeVoices.size >= POLYPHONY) {
      const oldest = this.activeVoices.values().next().value;
      if (!oldest) break;
      try { oldest.stop(); } catch { /* already stopped */ }
      this.activeVoices.delete(oldest);
    }

    const shape = VOICE_BY_KIND[opts.kind];
    const baseFreq = ELEMENT_FREQ_HZ[opts.element] * shape.octaveMul;
    const velocity = opts.velocity ?? 0.6;
    const peak = shape.gainPeak * velocity;
    const t0 = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = shape.type;
    osc.frequency.value = baseFreq;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + shape.attackS);
    // exponentialRampToValueAtTime requires a positive target — 0.001 is
    // standard "approaching silence" idiom; sounds like a clean fade.
    env.gain.exponentialRampToValueAtTime(0.001, t0 + shape.attackS + shape.decayS);

    osc.connect(env);
    env.connect(this.masterGain);

    osc.start(t0);
    osc.stop(t0 + shape.attackS + shape.decayS + 0.05);

    this.activeVoices.add(osc);
    osc.onended = () => {
      this.activeVoices.delete(osc);
      try { env.disconnect(); } catch { /* already disconnected */ }
    };
  }
}

// Module-singleton — only one AudioContext per page makes sense, and
// React StrictMode's double-invoke shouldn't spawn two graphs.
let instance: WuxingSonifier | null = null;

export function getSonifier(): WuxingSonifier {
  if (!instance) instance = new WuxingSonifier();
  return instance;
}
