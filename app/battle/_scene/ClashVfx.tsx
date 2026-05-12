"use client";

/**
 * ClashVfx — element-specific impact particles at the clash midpoint.
 *
 * Mounts inside the .clash-zone. Fires when activeClashPhase is "impact"
 * or "settle". Reads element from snap.lastPlayed (the most recently
 * surfaced player card during the staggered reveal).
 *
 * The component is dumb — all the per-element variation lives in the
 * `lib/vfx/clash-particles.ts` config. Adding a new element or mode
 * means adding a config entry, not editing this file. (Composability
 * doctrine, see grimoires/loa/proposals/composable-vfx-vocabulary.md.)
 *
 * CSS: app/battle/_styles/ClashVfx.css
 */

import { useEffect, useState } from "react";
import { buildClashParticles, type ParticleInstance } from "@/lib/vfx/clash-particles";
import type { Element } from "@/lib/honeycomb/wuxing";

interface ClashVfxProps {
  readonly element: Element | null;
  readonly visibleClashIdx: number;
  readonly activeClashPhase: "approach" | "impact" | "settle" | null;
}

interface ActiveBurst {
  readonly id: number;
  readonly element: Element;
  readonly particles: readonly ParticleInstance[];
}

export function ClashVfx({ element, visibleClashIdx, activeClashPhase }: ClashVfxProps) {
  const [bursts, setBursts] = useState<readonly ActiveBurst[]>([]);

  useEffect(() => {
    // Fire on impact only — settle is the "afterglow" phase, no fresh particles.
    if (activeClashPhase !== "impact") return;
    if (!element || visibleClashIdx < 0) return;
    const { kit, particles } = buildClashParticles(element, visibleClashIdx + 1);
    const id = Date.now() + visibleClashIdx;
    setBursts((prev) => [...prev, { id, element, particles }]);
    // Schedule cleanup once the keyframes have run.
    const cleanup = setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, kit.durationMs + 50);
    return () => clearTimeout(cleanup);
  }, [activeClashPhase, element, visibleClashIdx]);

  return (
    <>
      {bursts.map((b) => (
        <div key={b.id} className={`clash-vfx clash-vfx--${b.element}`} aria-hidden>
          {b.particles.map((p, i) => (
            <span
              key={i}
              className={`vfx-${p.kind}${p.variant ? ` ${p.variant}` : ""}`}
              style={p.style as React.CSSProperties}
            />
          ))}
        </div>
      ))}
    </>
  );
}
