"use client";

/**
 * ClashOrb — the central bloom at the clash midpoint during impact.
 *
 * One orb per clash, sized by whether it's the final clash of the round.
 * Colors derived from the two cards' elements + winner. Lives ~600ms,
 * then leaves. Sibling to ClashVfx; both inside .clash-zone.
 *
 * Ported from world-purupuru cycle-088 +page.svelte lines 529-537 + 1356-1381.
 */

import { useEffect, useRef, useState } from "react";
import type { ClashResult } from "@/lib/honeycomb/clash.port";
import type { Element } from "@/lib/honeycomb/wuxing";

interface ClashOrbProps {
  readonly clash: ClashResult | null;
  readonly visibleClashIdx: number;
  readonly totalClashes: number;
  readonly activeClashPhase: "approach" | "impact" | "settle" | null;
}

interface ActiveOrb {
  readonly id: number;
  readonly p1: Element;
  readonly p2: Element;
  readonly winner: Element | null;
  readonly isFinal: boolean;
}

const ORB_LIFETIME_MS = 700;

export function ClashOrb({
  clash,
  visibleClashIdx,
  totalClashes,
  activeClashPhase,
}: ClashOrbProps) {
  const [orbs, setOrbs] = useState<readonly ActiveOrb[]>([]);
  // Track in-flight removal timers so they survive effect re-runs
  // (the previous version returned `clearTimeout` from the effect, which
  // cancelled the orb's own removal when activeClashPhase flipped
  // impact → settle — leaving the orb on screen forever).
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Spawn an orb when a clash enters its impact phase. Per-orb cleanup
  // is scheduled here but NOT returned as effect cleanup — phase changes
  // must not cancel it.
  useEffect(() => {
    if (activeClashPhase !== "impact" || !clash) return;
    const winner: Element | null =
      clash.loser === "p1"
        ? clash.p2Card.card.element
        : clash.loser === "p2"
          ? clash.p1Card.card.element
          : null;
    const id = Date.now() + visibleClashIdx;
    setOrbs((prev) => [
      ...prev,
      {
        id,
        p1: clash.p1Card.card.element,
        p2: clash.p2Card.card.element,
        winner,
        isFinal: visibleClashIdx === totalClashes - 1,
      },
    ]);
    const t = setTimeout(() => {
      setOrbs((prev) => prev.filter((o) => o.id !== id));
      timersRef.current.delete(t);
    }, ORB_LIFETIME_MS);
    timersRef.current.add(t);
  }, [activeClashPhase, clash, visibleClashIdx, totalClashes]);

  // Hard reset when the clashing phase ends. Prevents residue from
  // bleeding into between-rounds / result.
  useEffect(() => {
    if (activeClashPhase !== null) return;
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current.clear();
    setOrbs([]);
  }, [activeClashPhase]);

  // Mount-lifetime cleanup
  useEffect(
    () => () => {
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current.clear();
    },
    [],
  );

  return (
    <>
      {orbs.map((o) => (
        <div
          key={o.id}
          className={`clash-orb${o.isFinal ? " clash-orb--final" : ""}`}
          aria-hidden
          style={
            {
              "--orb-p1": `var(--puru-${o.p1}-vivid)`,
              "--orb-p2": `var(--puru-${o.p2}-vivid)`,
              "--orb-winner": o.winner
                ? `var(--puru-${o.winner}-vivid)`
                : "var(--puru-honey-base)",
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}
