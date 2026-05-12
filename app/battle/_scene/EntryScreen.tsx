"use client";

/**
 * EntryScreen — 1:1 port of world-purupuru EntryScreen.svelte (Session 78).
 * Weather orb · wordmark · play button. CSS lives in app/battle/_styles/EntryScreen.css.
 */

import Image from "next/image";
import { ELEMENT_META, ELEMENT_ORDER, type Element } from "@/lib/honeycomb/wuxing";
import { matchCommand } from "@/lib/runtime/match.client";

interface EntryScreenProps {
  readonly weather: Element;
  readonly quizElement: Element | null;
  readonly challengeVs?: Element | null;
  readonly challengeScore?: { wins: number; losses: number } | null;
  readonly challengeFrom?: Element | null;
  readonly seed: string;
}

export function EntryScreen({
  weather,
  quizElement,
  challengeVs = null,
  challengeScore = null,
  challengeFrom = null,
  seed,
}: EntryScreenProps) {
  const onPlay = () => matchCommand.beginMatch();

  const btnGlow = quizElement
    ? `var(--puru-${quizElement}-vivid)`
    : "var(--puru-honey-base)";

  return (
    <div className="entry" data-element={quizElement ?? undefined}>
      <div className="weather-orb" data-element={weather}>
        <span className="orb-kanji">{ELEMENT_META[weather].kanji}</span>
      </div>

      {challengeVs ? (
        <div className="challenge-banner" data-element={challengeVs}>
          <span className="challenge-kanji">{ELEMENT_META[challengeVs].kanji}</span>
          <span className="challenge-label">
            Beat {ELEMENT_META[challengeVs].name}
            {challengeScore ? ` ${challengeScore.wins}-${challengeScore.losses}` : ""}
          </span>
          {challengeFrom && (
            <span className="challenge-from">
              {ELEMENT_META[challengeFrom].kanji} challenged you
            </span>
          )}
        </div>
      ) : (
        <div className="entry-title-block">
          <div className="entry-wordmark">
            <Image
              src="/brand/purupuru-wordmark.svg"
              alt="Purupuru"
              width={240}
              height={120}
              priority
              className="wordmark-svg"
            />
          </div>
          <span className="entry-subtitle">the game</span>
        </div>
      )}

      <div className="entry-actions">
        <button
          type="button"
          className={`tile-btn ${quizElement ? "tile-btn-element" : ""}`}
          data-element={quizElement ?? undefined}
          style={{ "--btn-glow": btnGlow } as React.CSSProperties}
          onClick={onPlay}
        >
          {challengeVs ? "Accept challenge" : "Play"}
        </button>

        {/* Ambient wuxing breathing strip — five kanji cycle in Shēng order */}
        <div className="entry-wuxing-strip" aria-hidden>
          {ELEMENT_ORDER.map((el, i) => (
            <span
              key={el}
              className="entry-wuxing-glyph"
              data-element={el}
              style={{ animationDelay: `${i * 0.8}s` } as React.CSSProperties}
            >
              {ELEMENT_META[el].kanji}
            </span>
          ))}
        </div>
      </div>

      <p className="entry-seed" aria-label={`Seed ${seed}`}>
        <span className="entry-seed-label">seed</span>
        <span className="entry-seed-code">{seed.slice(0, 8)}</span>
      </p>
    </div>
  );
}
