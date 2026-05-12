"use client";

/**
 * ParallaxLayer — translation-only camera responding to mouse position.
 *
 * Listens to mousemove on .battle-scene, normalizes to -1..+1, writes
 * --parallax-x / --parallax-y CSS variables. Different consumers
 * multiply by their own depth factor:
 *   .battlefield     × 1.0   (deepest — moves most)
 *   .arena           × 0.5   (mid — moves half)
 *   .player-card     × 0.2   (foreground — barely moves)
 *
 * Translation only, never rotation. Capped at the unit circle so big
 * monitors don't produce nausea-inducing extremes. RAF-throttled so
 * mousemove doesn't burn cycles.
 *
 * Doctrine — subtle camera without nausea:
 *   ✓ translation only (no rotation, no zoom-on-move)
 *   ✓ small magnitudes (max 4px on deepest layer)
 *   ✓ smooth (RAF + CSS transition)
 *   ✓ opt-out via prefers-reduced-motion (no event listener attached)
 *
 * No state in React — all mutation is via setProperty on the DOM
 * element so React doesn't re-render on mousemove.
 */

import { useEffect, useRef } from "react";

/** Deepest layer max travel — capped for nausea safety. Reads
 * `--puru-parallax-max` at mousemove time so JuiceTweakpane can
 * live-tune the value. Falls back to 4 if not set. */
function getMaxParallaxPx(): number {
  if (typeof window === "undefined") return 4;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--puru-parallax-max",
  );
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : 4;
}

export function ParallaxLayer() {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const root = document.querySelector<HTMLElement>(".battle-scene");
    if (!root) return;

    const onMove = (e: MouseEvent) => {
      if (rafRef.current !== null) return; // throttle
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const rect = root.getBoundingClientRect();
        // normalize to -1..+1
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        // clamp to unit-ish circle
        const cx = Math.max(-1, Math.min(1, nx));
        const cy = Math.max(-1, Math.min(1, ny));
        root.style.setProperty("--parallax-x", `${cx * getMaxParallaxPx()}px`);
        root.style.setProperty("--parallax-y", `${cy * getMaxParallaxPx()}px`);
        // Per-layer depth factors (also exposed so CSS can choose).
        // Cards barely move; backdrop moves most.
        root.style.setProperty(
          "--parallax-card-y",
          `${cy * getMaxParallaxPx() * 0.2}px`,
        );
        root.style.setProperty(
          "--parallax-arena-x",
          `${cx * getMaxParallaxPx() * 0.5}px`,
        );
        root.style.setProperty(
          "--parallax-arena-y",
          `${cy * getMaxParallaxPx() * 0.5}px`,
        );
      });
    };

    const onLeave = () => {
      // Decay back to 0 — CSS transition handles the smoothing.
      root.style.setProperty("--parallax-x", "0px");
      root.style.setProperty("--parallax-y", "0px");
      root.style.setProperty("--parallax-card-y", "0px");
      root.style.setProperty("--parallax-arena-x", "0px");
      root.style.setProperty("--parallax-arena-y", "0px");
    };

    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return null;
}
