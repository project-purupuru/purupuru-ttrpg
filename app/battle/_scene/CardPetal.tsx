"use client";

/**
 * CardPetal — modal detail view for a single card.
 *
 * Opens when the player long-presses (touch) or right-clicks (desktop)
 * a card in their hand. Renders:
 *   - Full-size CDN art (cardArtChain fallbacks)
 *   - Element kanji + caretaker name
 *   - Type label (striker / support / utility / transcendence)
 *   - Type-power number
 *   - Flavor text from card definition
 *   - Element virtue (Confucian — 仁/禮/信/義/智)
 *
 * Closes on backdrop click or Esc. Locks body scroll while open.
 *
 * The "petal" name comes from the world-purupuru convention — a card
 * blooms outward into a contemplative full view.
 */

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Card } from "@/lib/honeycomb/cards";
import { findDef, TYPE_POWER } from "@/lib/honeycomb/cards";
import { ELEMENT_META, SHENG, KE } from "@/lib/honeycomb/wuxing";
import { audioEngine } from "@/lib/audio/engine";
import { CARD_ART_PANELS, WORLD_SCENES } from "@/lib/cdn";

interface CardPetalProps {
  readonly card: Card | null;
  readonly onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  jani: "Striker",
  caretaker_a: "Support",
  caretaker_b: "Utility",
  transcendence: "Transcendence",
};

export function CardPetal({ card, onClose }: CardPetalProps) {
  // Lock scroll + listen for Esc while open
  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [card, onClose]);

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          className="petal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            audioEngine().play("ui.toggle");
            onClose();
          }}
          aria-modal="true"
          role="dialog"
          aria-label={`${ELEMENT_META[card.element].caretaker} card detail`}
        >
          <motion.article
            className="petal"
            data-element={card.element}
            data-card-type={card.cardType}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="petal-header">
              <span className="petal-kanji" data-element={card.element}>
                {ELEMENT_META[card.element].kanji}
              </span>
              <div className="petal-titles">
                <span className="petal-caretaker">
                  {ELEMENT_META[card.element].caretaker}
                </span>
                <span className="petal-type">{TYPE_LABEL[card.cardType] ?? card.cardType}</span>
              </div>
              <span
                className="petal-virtue"
                title={ELEMENT_META[card.element].virtue}
              >
                {ELEMENT_META[card.element].virtueKanji}
              </span>
            </header>

            {/* COMPOSED art panel — bare scene + character overlay,
                NO pre-rendered template chrome. The chrome is the
                .petal frame itself. Layers (bottom to top):
                1. .petal-art-bg     — soft scene background (low op)
                2. .petal-art        — the character art-panel composite
                3. .petal-power-badge— top-left rounded power chip
                4. .petal-cycle-strip— bottom strip with sheng/ke neighbors */}
            <div className="petal-art-wrap">
              <img
                className="petal-art-bg"
                src={WORLD_SCENES[card.element]}
                alt=""
                aria-hidden
              />
              <img
                className="petal-art"
                src={CARD_ART_PANELS[card.element]}
                alt={`${ELEMENT_META[card.element].caretaker} · ${card.cardType}`}
              />
              <div className="petal-power-badge" aria-label="power">
                <span className="petal-power-badge__num">{TYPE_POWER[card.cardType].toFixed(2)}</span>
                <span className="petal-power-badge__times">×</span>
              </div>
              {/* Sheng/Ke cycle strip — what this element BEATS and is BEATEN BY.
                  Replaces the placeholder bear icons. Real lore content. */}
              <div className="petal-cycle-strip">
                <div className="petal-cycle-pair" title={`Generates ${ELEMENT_META[SHENG[card.element]].name}`}>
                  <span className="petal-cycle-arrow">→</span>
                  <span
                    className="petal-cycle-kanji"
                    data-element={SHENG[card.element]}
                  >
                    {ELEMENT_META[SHENG[card.element]].kanji}
                  </span>
                </div>
                <div className="petal-cycle-pair" title={`Overcomes ${ELEMENT_META[KE[card.element]].name}`}>
                  <span className="petal-cycle-arrow">⚔</span>
                  <span
                    className="petal-cycle-kanji"
                    data-element={KE[card.element]}
                  >
                    {ELEMENT_META[KE[card.element]].kanji}
                  </span>
                </div>
              </div>
            </div>

            <footer className="petal-footer">
              {findDef(card.defId)?.name && (
                <p className="petal-name">{findDef(card.defId)?.name}</p>
              )}
              <p className="petal-flavor">{flavorFor(card)}</p>
              <button
                type="button"
                className="petal-close"
                onClick={() => {
                  audioEngine().play("ui.toggle");
                  onClose();
                }}
                aria-label="Close"
              >
                close
              </button>
            </footer>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function flavorFor(card: Card): string {
  const def = findDef(card.defId);
  if (!def) return "an unfamiliar card";
  // Caretaker cards inherit element-themed flavor; transcendence have abilities
  if (def.cardType === "transcendence") {
    return `${def.name} — ability: ${(def as { ability?: string }).ability ?? "—"}`;
  }
  return `${ELEMENT_META[card.element].caretaker} of ${ELEMENT_META[card.element].name.toLowerCase()}`;
}
