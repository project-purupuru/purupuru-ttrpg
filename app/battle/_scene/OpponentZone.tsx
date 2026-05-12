"use client";

/**
 * OpponentZone — 1:1 port of world-purupuru OpponentZone.svelte.
 * Face-down during arrange · revealed during clash/result · per-card clash
 * approach/impact/settle classes. CSS: app/battle/_styles/OpponentZone.css
 */

import type { Card } from "@/lib/honeycomb/cards";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { BRAND, cardArtChain } from "@/lib/cdn";
import { CdnImage } from "./CdnImage";

export type OpponentZoneArenaPhase = "rearrange" | "locked" | "clashing" | "result";

function cardArtFor(card: Card): readonly string[] {
  return cardArtChain(card.cardType, card.element);
}

interface OpponentZoneProps {
  readonly lineup: readonly Card[];
  readonly arenaPhase: OpponentZoneArenaPhase;
  readonly opponentElement: Element;
  readonly visibleClashIdx?: number;
  readonly activeClashPhase?: "approach" | "impact" | "settle" | null;
  readonly clashWinners?: ReadonlyMap<number, "player" | "opponent">;
  readonly stamps?: ReadonlySet<number>;
  readonly dying?: ReadonlySet<number>;
}

const BRAND_CARD_BACK = BRAND.logoCardBack;

export function OpponentZone({
  lineup,
  arenaPhase,
  visibleClashIdx = -1,
  activeClashPhase = null,
  clashWinners,
  stamps,
  dying,
}: OpponentZoneProps) {
  const isArrange = arenaPhase === "rearrange";
  const isLocked = arenaPhase === "locked";
  const isClashing = arenaPhase === "clashing";
  const isResult = arenaPhase === "result";

  return (
    <div className="opponent-zone">
      <div className="lineup opponent-lineup">
        <div
          className={`lineup-row${activeClashPhase !== null ? " has-active-clash" : ""}`}
        >
          {lineup.map((card, i) => {
            const winner = clashWinners?.get(i);
            const isDying = dying?.has(i) ?? false;
            const isStamped = stamps?.has(i) ?? false;
            const cls = [
              "card-slot",
              "opponent-card",
              isArrange && "face-down",
              (isLocked || isClashing || isResult) && "revealed",
              winner === "player" && isStamped && "lost",
              winner === "opponent" && isStamped && "won",
              isDying && "disintegrating",
              activeClashPhase === "approach" && visibleClashIdx === i && "clashing-approach",
              activeClashPhase === "impact" && visibleClashIdx === i && "clashing-impact",
              activeClashPhase === "settle" && visibleClashIdx === i && "clashing-settle",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={card.id}
                className={cls}
                data-element={card.element}
                style={{ "--card-idx": i } as React.CSSProperties}
              >
                {isArrange ? (
                  <img className="card-back" src={BRAND_CARD_BACK} alt="face down" />
                ) : (
                  <>
                    <CdnImage
                      className="card-art"
                      sources={cardArtFor(card)}
                      alt={`${ELEMENT_META[card.element].caretaker} · ${card.cardType}`}
                    />
                    <span className="card-kanji">{ELEMENT_META[card.element].kanji}</span>
                  </>
                )}
                {winner === "player" && isStamped && (
                  <>
                    <span className="stamp">敗</span>
                    <span className="floor-pulse floor-pulse--lose" />
                  </>
                )}
                {winner === "opponent" && isStamped && (
                  <span className="floor-pulse floor-pulse--win" data-element={card.element} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
