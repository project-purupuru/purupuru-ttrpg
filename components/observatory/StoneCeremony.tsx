"use client";

// Stone Recognition Ceremony — the bridge between the X-side mint and
// the in-world arrival. One-shot · plays once when the user lands on
// the observatory with `?welcome=<element>` and the per-element shown
// flag isn't set in localStorage. Premium reveal · zen restraint ·
// Disney 12-principles applied to a single hero asset.
//
// Motion spec authored by KANSEI (studio synthesis · 2026-05-10).
// See `lib/ceremony/stone-copy.ts` for per-element content.
//
// ── Stage sequence (1700ms total reveal · indefinite dwell · 520ms exit) ──
//
//   Hush          0–180ms   Page dims, scrim fades, world canvas blurs.
//   Anticipation  180–360ms Stone-shaped void settles where the stone will be.
//   Crack         360–540ms A single hairline of element light traces upward
//                            from below the void. The "kiln opens."
//   Rise          540–1240ms Stone enters from translateY(36px) along a
//                            14px lateral arc + slight rotate(-1.5deg)
//                            settling to 0deg. Slow-in/slow-out.
//   Settle        1240–1480ms Asymmetric squash (scaleY 0.96 → 1.015 → 1)
//                            + scaleX inverse — Disney follow-through.
//   Inscribe      1300–1700ms Eyebrow → name → flavor lines stagger-fade in
//                            with 60–80ms cascade (overlaps Settle).
//   Dwell         1700ms+    Three desynchronized loops:
//                              • stone breath — translateY only (NOT scale)
//                              • inner glow — period = breath × 1.7
//                              • drift particles — randomized per-element
//                            The triple-incommensurate-period rule is what
//                            makes the stone read as "alive object" instead
//                            of "animated card."
//
//   Exit (520ms · "deposit" not "dismissal")
//     Text fades first (0–80ms) — type was the frame.
//     Stone arcs upward then plunges + scales toward world (80–340ms).
//     Scrim un-blurs underneath (240–460ms).
//     Bloom at landing (340–520ms).
//
// Disney 12 principles applied (Kansei spec §6):
//   Anticipation     ✓ Hush + Crack
//   Squash & stretch ✓ Settle (asymmetric, restrained)
//   Slow-in/out      ✓ ease-puru-flow on every entry curve
//   Follow-through   ✓ Inscribe overlaps Settle; exit text leads
//   Arc              ✓ Rise lateral; exit lifts before plunge
//   Secondary action ✓ glow + particles + type, all subordinate to breath
//   Staging          ✓ scrim + blur + centered, nothing competes
//   Timing           ✓ 1700ms reveal, 520ms exit · dwell-able, decisive
//   Exaggeration     ✓ restrained · overshoot capped at 1.015
//   Solid drawing    ✓ rotate(-1.5deg) on rise gives volume
//   Appeal           ✓ asset carries · motion stays out of the way
//
// What this deliberately does NOT do (Kansei spec §7):
//   ✗ No theatrical entrance · no light rays, no confetti, no flash
//   ✗ No scale-based breath · translate only (HoloCard discipline)
//   ✗ No card chrome · no glass card frame, no XP bar — the stone
//     alone on scrim. Type rests the eye, not a frame.

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Element } from "@/lib/score";
import {
  CEREMONY_BRIDGE_LINE,
  CEREMONY_DISMISS_LINE,
  STONE_COPY,
  hasStoneCeremonyBeenShown,
  markStoneCeremonyShown,
} from "@/lib/ceremony/stone-copy";

interface Props {
  element: Element;
  onDismiss: () => void;
}

// ── Per-element ambient signatures ──────────────────────────────────
// Kansei spec §4. Each element has its own particle behavior and glow
// modulation amplitude — wood spores rise outward, fire flickers up,
// earth dust falls, metal barely moves, water drifts sideways.

interface AmbientSig {
  /** Mote count — kept low; noise erodes ceremony. */
  count: number;
  /** Vertical drift in viewport units; negative = up, positive = falling. */
  driftY: number;
  /** Horizontal sway amplitude in px. */
  swayX: number;
  /** Mote travel duration range [min, max] in seconds. */
  durRange: readonly [number, number];
  /** Mote pixel size range [min, max]. */
  sizeRange: readonly [number, number];
  /** Glow modulation amplitude — 0 disables modulation (metal). */
  glowMod: number;
  /** Settle squash intensity multiplier — earth heavier, fire snappier. */
  squashWeight: number;
}

const AMBIENT: Record<Element, AmbientSig> = {
  wood: {
    count: 6,
    driftY: -1, // upward · spore drift
    swayX: 12,
    durRange: [10, 14],
    sizeRange: [2, 3.5],
    glowMod: 0.27,
    squashWeight: 1,
  },
  fire: {
    count: 7,
    driftY: -1, // upward · fast
    swayX: 6,
    durRange: [6, 9],
    sizeRange: [2, 4],
    glowMod: 0.32,
    squashWeight: 0.9, // snappier settle
  },
  earth: {
    count: 6,
    driftY: 1, // FALLING · settling dust
    swayX: 8,
    durRange: [12, 16],
    sizeRange: [2, 3.5],
    glowMod: 0.25,
    squashWeight: 1.15, // heaviest settle
  },
  metal: {
    count: 2, // barely move
    driftY: -1,
    swayX: 4,
    durRange: [16, 22],
    sizeRange: [1.5, 2.5],
    glowMod: 0, // flat — no modulation
    squashWeight: 1,
  },
  water: {
    count: 5,
    driftY: -1,
    swayX: 18, // drifts sideways more than up
    durRange: [11, 15],
    sizeRange: [2, 3],
    glowMod: 0.22,
    squashWeight: 1.05, // tiny ripple bounce
  },
};

interface Mote {
  startX: number;
  delay: number;
  dur: number;
  size: number;
  swaySign: 1 | -1;
}

// Deterministic LCG so SSR matches CSR without crypto/useId overhead.
// Element seeds shift the constellation per element.
const ELEMENT_SEEDS: Record<Element, number> = {
  wood: 11,
  fire: 27,
  earth: 43,
  metal: 59,
  water: 71,
};

function buildMotes(seed: number, sig: AmbientSig): Mote[] {
  let state = seed * 9301 + 49297;
  const next = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  return Array.from({ length: sig.count }, () => ({
    startX: 8 + next() * 84,
    delay: next() * 4,
    dur: sig.durRange[0] + next() * (sig.durRange[1] - sig.durRange[0]),
    size: sig.sizeRange[0] + next() * (sig.sizeRange[1] - sig.sizeRange[0]),
    swaySign: next() > 0.5 ? 1 : -1,
  }));
}

export function StoneCeremony({ element, onDismiss }: Props) {
  const copy = STONE_COPY[element];
  const sig = AMBIENT[element];
  const reduce = useReducedMotion();
  const [closing, setClosing] = useState(false);
  const motes = useMemo(() => buildMotes(ELEMENT_SEEDS[element], sig), [element, sig]);

  const handleDismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    markStoneCeremonyShown(element);
  }, [closing, element]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleDismiss();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleDismiss]);

  const breathSec = copy.breathDurMs / 1000;
  // Glow period = breath × 1.7 — incommensurate-period rule (Kansei §3).
  const glowSec = breathSec * 1.7;

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {!closing && (
        <motion.div
          key="ceremony"
          // cursor-pointer on the scrim signals the whole surface is
          // clickable — matches the "tap to enter the world" affordance
          // without making it the only target.
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center"
          // ── Hush + Anticipation backdrop ──────────────────────────
          // Live blur on whatever's behind (the actual observatory canvas)
          // + opaque scrim with element-tinted center glow. The blur
          // fades in and the scrim deepens during the Hush beat
          // (0–180ms). Scrim must be near-opaque so the activity rail
          // and weather tile don't compete with the ceremony — the
          // world is behind a curtain right now.
          style={{
            backdropFilter: "blur(20px) saturate(0.5)",
            WebkitBackdropFilter: "blur(20px) saturate(0.5)",
            background: `radial-gradient(circle at 50% 55%, color-mix(in oklch, var(--puru-cloud-shadow) 88%, transparent) 0%, var(--puru-cloud-shadow) 65%, var(--puru-cloud-shadow) 100%), radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--puru-${element}-vivid) 22%, transparent) 0%, transparent 55%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.16 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDismiss}
        >
          {/* ── Drift particles · element-specific ambient motion ─── */}
          {!reduce && sig.count > 0 && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {motes.map((m, i) => {
                // driftY: -1 = up (spawn below, exit top), +1 = falling
                const startBottom = sig.driftY < 0 ? "-4%" : undefined;
                const startTop = sig.driftY > 0 ? "-4%" : undefined;
                const yKeyframes = sig.driftY < 0
                  ? [0, -1.2 * 800] // upward exit (rough · viewport-relative)
                  : [0, 0.6 * 800]; // settling fall
                return (
                  <motion.span
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${m.startX}%`,
                      bottom: startBottom,
                      top: startTop,
                      width: m.size,
                      height: m.size,
                      background: `var(--puru-${element}-vivid)`,
                      boxShadow: `0 0 ${m.size * 3.5}px var(--puru-${element}-vivid)`,
                      filter: "blur(0.5px)",
                    }}
                    initial={{ y: 0, x: 0, opacity: 0 }}
                    animate={{
                      y: yKeyframes,
                      // Sine sway via two-segment keyframe — element swayX
                      x: [0, m.swaySign * sig.swayX, -m.swaySign * sig.swayX * 0.6, 0],
                      opacity: [0, 0.55, 0.45, 0],
                    }}
                    transition={{
                      duration: m.dur,
                      delay: m.delay + 0.6,
                      repeat: Infinity,
                      ease: "linear",
                      times: [0, 0.18, 0.78, 1],
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* ── Card group · the stone is part of the dismiss surface
                (most natural "ready to enter" gesture). Only the type
                stack below stops propagation — those words are meant
                to be dwelt on, not click-targets. */}
          <motion.div className="relative flex flex-col items-center">
            {/* ── Crack — Anticipation beat (360–540ms) ───────────── */}
            {/* A single hairline of element light traces upward from
                below the void. The "kiln opens." Peaks at 460ms, fades
                by 540ms when the stone arrives. */}
            {!reduce && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: "55%",
                  width: 1.5,
                  height: 80,
                  background: `linear-gradient(to top, transparent, var(--puru-${element}-vivid), color-mix(in oklch, var(--puru-honey-bright) 60%, white) 80%, transparent)`,
                  boxShadow: `0 0 14px var(--puru-${element}-vivid)`,
                  transformOrigin: "bottom",
                }}
                initial={{ opacity: 0, scaleY: 0.3 }}
                animate={{
                  opacity: [0, 0.95, 0],
                  scaleY: [0.3, 1, 1.1],
                }}
                transition={{
                  duration: 0.18,
                  delay: 0.36,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.55, 1],
                }}
              />
            )}

            {/* ── Anticipation void · settles where the stone will be ── */}
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  width: 220,
                  height: 220,
                  background: `radial-gradient(circle at 50% 50%, color-mix(in oklch, oklch(0.04 0.008 80) 35%, transparent) 0%, transparent 70%)`,
                  filter: "blur(12px)",
                  transform: "translateY(-30px)",
                }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: [0, 0.4, 0], scale: [0.92, 1, 1] }}
                transition={{
                  duration: 0.36,
                  delay: 0.18,
                  ease: [0.4, 0, 0.6, 1],
                  times: [0, 0.5, 1],
                }}
              />
            )}

            {/* ── Stone · the hero asset ───────────────────────────── */}
            {/* Outer wrapper: Rise (translateY + lateral arc + rotate)
                + Settle squash. Inner wrapper: continuous breath.
                Sized large — the stone is the entire show. The flavor
                copy reads at first glance below. */}
            <motion.div
              className="relative h-[420px] w-[360px] sm:h-[500px] sm:w-[420px]"
              initial={{
                opacity: 0,
                y: reduce ? 0 : 36,
                rotate: reduce ? 0 : -1.5,
                scale: reduce ? 1 : 0.94,
              }}
              animate={
                reduce
                  ? { opacity: 1, y: 0, rotate: 0, scale: 1 }
                  : {
                      // Rise (540ms duration starting at 540ms delay) +
                      // lateral arc + Settle squash (1240–1480ms) all
                      // expressed as a single keyframe sequence on a
                      // 940ms total duration so motion can interpolate
                      // smoothly without two competing animate calls.
                      opacity: [0, 1, 1, 1, 1],
                      y: [36, 0, 0, 0, 0],
                      x: [0, 6, -3, 0, 0],
                      rotate: [-1.5, 0, 0, 0, 0],
                      // Settle squash · scaleX/Y inverse · Disney
                      // follow-through · element-weighted intensity.
                      scaleY: [
                        0.94,
                        1,
                        1 - 0.04 * sig.squashWeight,
                        1 + 0.015 * sig.squashWeight,
                        1,
                      ],
                      scaleX: [
                        0.94,
                        1,
                        1 + 0.03 * sig.squashWeight,
                        1 - 0.008 * sig.squashWeight,
                        1,
                      ],
                    }
              }
              transition={
                reduce
                  ? { duration: 0.18, delay: 0.06, ease: "easeOut" }
                  : {
                      duration: 0.94,
                      delay: 0.54,
                      ease: [0.34, 1.04, 0.42, 1],
                      times: [0, 0.3, 0.74, 0.86, 1],
                    }
              }
              style={{ transformOrigin: "50% 100%" }}
            >
              {/* Halo behind stone · independent glow modulation period.
                  Inset negative so the glow extends past the stone box
                  for a felt-not-seen warm bloom. */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-12"
                style={{
                  background: `radial-gradient(circle at 50% 60%, color-mix(in oklch, var(--puru-${element}-vivid) 38%, transparent) 0%, color-mix(in oklch, var(--puru-honey-base) 24%, transparent) 26%, transparent 65%)`,
                  filter: "blur(14px)",
                }}
                initial={{ opacity: 0 }}
                animate={
                  reduce || sig.glowMod === 0
                    ? { opacity: 0.55 }
                    : {
                        // 1.7× breath period · incommensurate
                        opacity: [
                          0.4,
                          0.4 + sig.glowMod,
                          0.4,
                          0.4 + sig.glowMod * 0.7,
                          0.4,
                        ],
                      }
                }
                transition={
                  reduce || sig.glowMod === 0
                    ? { duration: 0.4, delay: 0.6 }
                    : {
                        duration: glowSec,
                        delay: 1.0,
                        repeat: Infinity,
                        ease: [0.45, 0.05, 0.55, 0.95],
                      }
                }
              />

              {/* Inner: the stone breathes via translateY only */}
              <motion.div
                className="absolute inset-0 flex items-end justify-center"
                animate={reduce ? undefined : { y: [0, -3, 0] }}
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: breathSec,
                        delay: 1.6, // start dwell breath after Settle
                        repeat: Infinity,
                        ease: [0.45, 0.05, 0.55, 0.95],
                      }
                }
              >
                <Image
                  src={`/art/stones/transparent/${element}.png`}
                  alt={`${copy.headline} stone`}
                  width={420}
                  height={500}
                  priority
                  className="h-auto w-[300px] sm:w-[360px]"
                  style={{
                    filter: `drop-shadow(0 18px 28px color-mix(in oklch, var(--puru-${element}-vivid) 32%, transparent)) drop-shadow(0 6px 10px oklch(0.06 0.008 80 / 0.45))`,
                  }}
                />
              </motion.div>
            </motion.div>

            {/* ── Inscribe · type stack below the stone ──────────── */}
            {/* Eyebrow · headline · two-line flavor. Each fades in with
                60–80ms cascade, beginning at 1300ms so it overlaps the
                Settle beat (Disney follow-through).
                Wrapper stops click propagation: words are meant to be
                dwelt on, not click-targets. The dismiss button below
                + the stone above + the scrim around all dismiss. */}
            {/* Type stack uses default cursor — these words are for
                reading, not for clicking. The cursor reverts on the
                scrim so it still reads as click-to-dismiss everywhere
                else. */}
            <div
              className="flex cursor-default flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Single hairline above eyebrow (Kansei §8 zen-translation
                  of the laurel-wreath ornament). One stroke, element-tinted,
                  says "this matters" without theater. */}
              <motion.span
                aria-hidden
                className="mt-6 block h-px w-6"
                style={{
                  background: `color-mix(in oklch, var(--puru-${element}-vivid) 40%, transparent)`,
                }}
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: reduce ? 0.16 : 1.3 }}
              />

              {/* Bridge line · direct echo of the Blink mint POST
                  response ("Your Fire stone is in the world") that
                  the user just clicked through with the "See yourself
                  in the world" button. This IS the missing Z5→Z6
                  arrival callback the user-journey-map identifies. */}
              <motion.div
                className="mt-3 font-puru-mono text-[10px] uppercase tracking-[0.32em] text-puru-ink-soft/70"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0.18 : 1.36 }}
              >
                {CEREMONY_BRIDGE_LINE}
              </motion.div>

              {/* Single headline · element name in display Yuruka.
                  The kanji is intentionally NOT duplicated next to the
                  title — the stone itself already carries it, and the
                  eyebrow names the element verbally. */}
              <motion.h2
                className="mt-2 font-puru-display text-[2.75rem] leading-none text-puru-ink-rich"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0.22 : 1.42 }}
              >
                {copy.headline}
              </motion.h2>

              <div className="mt-5 flex flex-col items-center gap-1.5 px-6 text-center">
                {copy.flavor.map((line, i) => (
                  <motion.p
                    key={i}
                    className="text-base text-puru-ink-base sm:text-lg"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.36,
                      ease: [0.22, 1, 0.36, 1],
                      delay: reduce ? 0.26 + i * 0.04 : 1.5 + i * 0.08,
                    }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </div>

            {/* ── Dismiss prompt · the only "instruction" copy ──────
                Slow breath-pulse on opacity so the prompt is
                discoverable without shouting. The whole scrim is
                clickable but this prompt is inside the card group's
                stopPropagation zone — its own onClick mirrors the
                scrim's so the user can tap the affordance directly,
                tap anywhere on the scrim, or hit Escape/Enter/Space.
                Also rendered as a button for keyboard + a11y. */}
            <motion.button
              type="button"
              onClick={handleDismiss}
              className="group mt-10 cursor-pointer font-puru-mono text-[10px] uppercase tracking-[0.32em] text-puru-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puru-honey-base"
              initial={{ opacity: 0 }}
              animate={reduce ? { opacity: 0.75 } : { opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: reduce ? 0.36 : 1.85 }}
              aria-label={CEREMONY_DISMISS_LINE}
            >
              <motion.span
                animate={reduce ? undefined : { opacity: [0.55, 0.85, 0.55] }}
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: 3.2,
                        delay: 2.4,
                        repeat: Infinity,
                        ease: [0.45, 0.05, 0.55, 0.95],
                      }
                }
                className="inline-block transition-colors group-hover:text-puru-ink-rich"
              >
                {CEREMONY_DISMISS_LINE}
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper consumed by ObservatoryClient — should we render the ceremony
// for the current visit? Reads the URL ?welcome param + per-element
// shown flag. Returns the element to celebrate, or null.
export function readWelcomeElement(): Element | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search)
    .get("welcome")
    ?.toLowerCase();
  if (!raw) return null;
  const VALID: readonly Element[] = ["wood", "fire", "earth", "metal", "water"];
  if (!VALID.includes(raw as Element)) return null;
  const el = raw as Element;
  if (hasStoneCeremonyBeenShown(el)) return null;
  return el;
}
