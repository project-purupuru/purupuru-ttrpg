"use client";

/**
 * ClashOrb — the central bloom at the clash midpoint during impact.
 *
 * One orb per clash, sized by whether it's the final clash of the round.
 * Colors derived from the two cards' elements + winner. Lives ~600ms,
 * then leaves. Sibling to ClashVfx; both inside .clash-zone.
 *
 * The orb is the "consequence" beat. Without it, the impact lands as a
 * particle puff and a stamp — but no SOUND. The orb is the sound made
 * visible.
 *
 * Ported from world-purupuru cycle-088 +page.svelte lines 529-537 + 1356-1381.
 */

import { useEffect, useState } from "react";
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

export function ClashOrb({
  clash,
  visibleClashIdx,
  totalClashes,
  activeClashPhase,
}: ClashOrbProps) {
  const [orbs, setOrbs] = useState<readonly ActiveOrb[]>([]);

  useEffect(() => {
    if (activeClashPhase !== "impact") return;
    if (!clash) return;
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
    }, 700);
    return () => clearTimeout(t);
  }, [activeClashPhase, clash, visibleClashIdx, totalClashes]);

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
