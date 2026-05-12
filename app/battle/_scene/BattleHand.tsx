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
import { CARD_SATURATED, CARD_PASTEL, JANI_CARDS } from "@/lib/cdn";

interface BattleHandProps {
  readonly cards: readonly Card[];
  readonly phase: MatchPhase;
  readonly turnElement: Element;
  readonly selectedIndex?: number | null;
  readonly stamps?: ReadonlySet<number>;
  readonly dying?: ReadonlySet<number>;
  readonly onPlay?: (card: Card) => void;
  readonly onTap?: (index: number) => void;
  readonly onSwap?: (a: number, b: number) => void;
  readonly onSkip?: () => void;
}

function fanRotation(index: number, total: number): number {
  if (total <= 1) return 0;
  const spread = 7;
  const offset = ((total - 1) * spread) / 2;
  return index * spread - offset;
}

function fanLift(index: number, total: number): number {
  if (total <= 1) return 0;
  const mid = (total - 1) / 2;
  return Math.abs(index - mid) * 5;
}

function setLabel(t: Card["cardType"]): string {
  if (t === "jani") return "striker";
  if (t === "caretaker_a") return "support";
  if (t === "caretaker_b") return "utility";
  return "transcendence";
}

/** Pick the right CDN composite per card. Jani → jani card · caretaker_a →
 * saturated · caretaker_b → pastel · transcendence falls back to saturated. */
function cardArtFor(card: Card): string {
  if (card.cardType === "jani") return JANI_CARDS[card.element];
  if (card.cardType === "caretaker_b") return CARD_PASTEL[card.element];
  return CARD_SATURATED[card.element];
}

export function BattleHand({
  cards,
  phase,
  turnElement,
  selectedIndex = null,
  stamps,
  dying,
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
    <div className={`hand${canPlay ? "" : " disabled"}`}>
      {total > 0 ? (
        <>
          <div className="cards">
            {cards.map((card, i) => {
              const isSelected = selectedIndex === i;
              const isStamped = stamps?.has(i) ?? false;
              const isDying = dying?.has(i) ?? false;
              const cls = [
                "card-slot",
                "card-slot--art",
                isSelected && "selected",
                isStamped && "stamped",
                isDying && "disintegrating",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={card.id}
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
                  style={
                    {
                      "--fan-rot": `${fanRotation(i, total)}deg`,
                      "--fan-y": `${fanLift(i, total)}px`,
                    } as React.CSSProperties
                  }
                  aria-label={`Play ${card.element} ${ELEMENT_META[card.element].name}`}
                  aria-pressed={isSelected}
                >
                  <img
                    className="card-art"
                    src={cardArtFor(card)}
                    alt={`${ELEMENT_META[card.element].caretaker} · ${setLabel(card.cardType)}`}
                    loading="lazy"
                  />
                  <span className="card-set-overlay">{setLabel(card.cardType)}</span>
                  {card.element === turnElement && (
                    <span className="turn-match" aria-label="Matches this turn's element">
                      +
                    </span>
                  )}
                  {isStamped && <span className="card-stamp">敗</span>}
                </button>
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
