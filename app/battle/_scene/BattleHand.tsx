"use client";

/**
 * BattleHand — 1:1 port of world-purupuru BattleHand.svelte.
 * Card fan layout (--fan-rot, --fan-y inline) · element tint+pastel
 * gradient · turn-match honey marker · skip button.
 * CSS: app/battle/_styles/BattleHand.css
 */

import type { Card } from "@/lib/honeycomb/cards";
import type { MatchPhase } from "@/lib/honeycomb/match.port";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { cardArtChain } from "@/lib/cdn";
import { CdnImage } from "./CdnImage";

interface BattleHandProps {
  readonly cards: readonly Card[];
  readonly phase: MatchPhase;
  readonly turnElement: Element;
  readonly selectedIndex?: number | null;
  readonly stamps?: ReadonlySet<number>;
  readonly dying?: ReadonlySet<number>;
  readonly visibleClashIdx?: number;
  readonly activeClashPhase?: "approach" | "impact" | "settle" | null;
  /**
   * Per-position clash winners. Used to gate the 敗 stamp + .lost class to
   * positions where the PLAYER lost (clash.winner === "opponent"). Without
   * this gate, every clash position would show 敗 even on wins.
   */
  readonly clashWinners?: ReadonlyMap<number, "player" | "opponent">;
  /**
   * Positions saved by Caretaker A Shield this round. Suppresses the 敗
   * stamp and shows a shield-burst glyph instead, so the player sees the
   * save mechanic rather than a "dead but undead" card.
   */
  readonly shielded?: ReadonlySet<number>;
  readonly onPlay?: (card: Card) => void;
  readonly onTap?: (index: number) => void;
  readonly onSwap?: (a: number, b: number) => void;
  readonly onSkip?: () => void;
}

/** Canonical fan from cycle-088 +page.svelte:
 *   --fan-rotate: fanOffset * 3 deg
 *   --fan-y:      |fanOffset| * 4 px
 *   where fanOffset = i - (total-1)/2
 */
function fanRotation(index: number, total: number): number {
  if (total <= 1) return 0;
  const fanCenter = (total - 1) / 2;
  return (index - fanCenter) * 3;
}

function fanLift(index: number, total: number): number {
  if (total <= 1) return 0;
  const fanCenter = (total - 1) / 2;
  return Math.abs(index - fanCenter) * 4;
}

function setLabel(t: Card["cardType"]): string {
  if (t === "jani") return "striker";
  if (t === "caretaker_a") return "support";
  if (t === "caretaker_b") return "utility";
  return "transcendence";
}

/** Ordered fallback chain for card art — see lib/cdn.ts. */
function cardArtFor(card: Card): readonly string[] {
  return cardArtChain(card.cardType, card.element);
}

export function BattleHand({
  cards,
  phase,
  turnElement,
  selectedIndex = null,
  stamps,
  dying,
  visibleClashIdx = -1,
  activeClashPhase = null,
  clashWinners,
  shielded,
  onPlay,
  onTap,
  onSwap,
  onSkip,
}: BattleHandProps) {
  const canPlay = phase === "arrange" || phase === "between-rounds";
  const total = cards.length;

  const onCardClick = (i: number, card: Card) => {
    if (canPlay && onTap) onTap(i);
    else if (onPlay) onPlay(card);
  };
  const onDragStart = (e: React.DragEvent, i: number) => {
    if (!canPlay) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(i));
  };
  const onDragOver = (e: React.DragEvent) => {
    if (!canPlay) return;
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent, j: number) => {
    if (!canPlay || !onSwap) return;
    e.preventDefault();
    const i = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isFinite(i) && i !== j) onSwap(i, j);
  };

  return (
    <div className={`lineup player-lineup${canPlay ? "" : " disabled"}`}>
      {total > 0 ? (
        <>
          <div
            className={`lineup-row${activeClashPhase !== null ? " has-active-clash" : ""}`}
          >
            {cards.map((card, i) => {
              const isSelected = selectedIndex === i;
              // The 敗 stamp + .lost class only fire on positions the PLAYER
              // lost. Positions the player WON share the same `stamps` set
              // (every resolved clash adds an index) but stay clean visually.
              // Shielded positions suppress 敗 and show a shield-burst instead —
              // they survived via Caretaker A Shield (world-purupuru spec).
              const isShielded = shielded?.has(i) ?? false;
              const lostThisPosition =
                !isShielded && stamps?.has(i) && clashWinners?.get(i) === "opponent";
              const wonThisPosition = stamps?.has(i) && clashWinners?.get(i) === "player";
              const isDying = dying?.has(i) ?? false;
              const isActiveClash = visibleClashIdx === i;
              const cls = [
                "card-slot",
                "player-card",
                isSelected && "selected",
                lostThisPosition && "stamped",
                lostThisPosition && "lost",
                wonThisPosition && "won",
                isShielded && "shielded",
                isDying && "disintegrating",
                isActiveClash && activeClashPhase === "approach" && "clashing-approach",
                isActiveClash && activeClashPhase === "impact" && "clashing-impact",
                isActiveClash && activeClashPhase === "settle" && "clashing-settle",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <div
                  key={card.id}
                  className="card-slot-wrap"
                  data-slot={i}
                  style={
                    {
                      "--fan-rotate": `${fanRotation(i, total)}deg`,
                      "--fan-y": `${fanLift(i, total)}px`,
                      "--fan-z": i + 1,
                      "--deal-delay": `${i * 80}ms`,
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    className={cls}
                    data-element={card.element}
                    data-card-type={card.cardType}
                    disabled={!canPlay && !onPlay}
                    draggable={canPlay}
                    onClick={() => onCardClick(i, card)}
                    onDragStart={(e) => onDragStart(e, i)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, i)}
                    aria-label={`Play ${card.element} ${ELEMENT_META[card.element].name}`}
                    aria-pressed={isSelected}
                  >
                    <CdnImage
                      className="card-art"
                      sources={cardArtFor(card)}
                      alt={`${ELEMENT_META[card.element].caretaker} · ${setLabel(card.cardType)}`}
                    />
                    <span className="card-set-overlay">{setLabel(card.cardType)}</span>
                    {card.element === turnElement && (
                      <span className="turn-match" aria-label="Matches this turn's element">
                        +
                      </span>
                    )}
                    {lostThisPosition && <span className="card-stamp">敗</span>}
                    {isShielded && (
                      <span
                        className="shield-burst"
                        data-element={card.element}
                        aria-label="Saved by Caretaker A Shield"
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          {canPlay && onSkip && (
            <button type="button" className="skip-btn" onClick={onSkip}>
              let the tide carry
            </button>
          )}
        </>
      ) : (
        canPlay && <p className="empty-hand">the tide carries</p>
      )}
    </div>
  );
}
