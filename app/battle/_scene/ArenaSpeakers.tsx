"use client";

/**
 * ArenaSpeakers — caretaker voice surface. FR-8.
 *
 * Evolves WhisperBubble (kept for /kit + legacy /battle reads from Battle).
 * Renders the player's caretaker speaking at one edge of the battlefield.
 * Opponent caretaker is voiceless (Persona/Futaba navigator pattern).
 */

import { AnimatePresence, motion } from "motion/react";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { ELEMENT_TINT_BG } from "./_element-classes";

interface ArenaSpeakersProps {
  readonly line: string | null;
  readonly element: Element;
  /** Edge to render on. Defaults to left (player) · 'right' could be used for opponent reveals (currently voiceless per canon). */
  readonly edge?: "left" | "right";
}

export function ArenaSpeakers({ line, element, edge = "left" }: ArenaSpeakersProps) {
  const positionClass = edge === "left" ? "left-4" : "right-4";

  return (
    <div className={`fixed bottom-32 ${positionClass} z-40 max-w-sm pointer-events-none`}>
      <AnimatePresence mode="wait">
        {line && (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: edge === "left" ? -20 : 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: edge === "left" ? -10 : 10, scale: 0.96 }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0.32, 1] }}
            className={`relative rounded-3xl px-4 py-3 ${ELEMENT_TINT_BG[element]} text-puru-ink-rich shadow-puru-tile`}
          >
            {/* Caretaker portrait placeholder (S5 wires real asset · purupuru-fire.png etc) */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-puru-cloud-bright shadow-puru-tile grid place-items-center flex-shrink-0">
                <span className="font-puru-display text-xl">{ELEMENT_META[element].kanji}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-puru-display text-2xs uppercase tracking-wide text-puru-ink-soft">
                  {ELEMENT_META[element].caretaker}
                </span>
                <p className="font-puru-body text-sm leading-puru-normal">{line}</p>
              </div>
            </div>
            {/* Tail */}
            <div
              aria-hidden
              className={`absolute -bottom-1.5 ${edge === "left" ? "left-8" : "right-8"} w-3 h-3 rotate-45 ${ELEMENT_TINT_BG[element]}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
