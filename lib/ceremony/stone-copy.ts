// Per-element ceremony content — element name + 2-line flavor + breath
// rhythm. The flavor lines are deliberate echoes of ARCHETYPE_REVEALS
// (`packages/medium-blink/src/voice-corpus.ts:131-141`) — the user
// just read the second-person identity line on the Blink reveal
// ("You move first and the room moves with you") and signed the mint.
// The ceremony picks up that voice — same person, now with a stone.
//
// Voice register (locked across the journey):
//   - second-person ("you", "yours")
//   - present tense
//   - lowercase, periods only
//   - "plain personality-test language · grounded · no metaphor"
//     (operator decree 2026-05-09 when "tide" was stripped from
//     ARCHETYPE_REVEALS for being meaningless to cold readers)
//
// Voice arc through the journey (KEEPER 2026-05-11):
//   ambient    "Fire leads today · 47 have read themselves in"
//   quiz       "Your friend cancels plans last minute. What's your
//                first reaction?"
//   reveal     "You are Fire. You move first and the room moves with
//                you. Quiet is hard for you."
//   mint POST  "Your Fire stone is in the world. Eight answers became
//                one element. The stone is yours to keep."
//   ceremony   THIS — "your stone is in the world" + echo of reveal +
//                arrival twist
//   plaza      observatory KPI strip + activity rail (clinical-dashboard)
//
// Each flavor pair: line 1 echoes the user's identity (same voice as
// the reveal they just read); line 2 closes the "see yourself in the
// world" promise the Blink button just made.

import type { Element } from "@/lib/score";

export interface StoneCopy {
  /** Display headline — Title Case Yuruka display, the element name.
   *  Operator decision 2026-05-11 · uppercase first letter so the
   *  element name reads as a proper noun (you ARE Fire, not "you are
   *  fire"), which composes with the Blink reveal voice
   *  ("You are Fire. You move first..."). The headline color is
   *  applied at the component level to match the element kanji glow
   *  on the stone. */
  headline: string;
  /** Two-line flavor copy, period-terminated, second-person, lowercase.
   *  L1 = echo of ARCHETYPE_REVEALS · L2 = arrival in the world. */
  flavor: readonly [string, string];
  /** Element-tuned breath rhythm — wood patient, fire fast, etc.
   *  Sets both stone breath and inner glow modulation periods. */
  breathDurMs: number;
}

// Bridge line shown above the stone for every element. Direct echo of
// the Blink mint POST response title ("Your Fire stone is in the world.")
// at app/api/actions/mint/genesis-stone/route.ts:310 — the line the user
// just clicked through with "See yourself in the world." This IS the
// Z5→Z6 callback the user-journey-map identifies as the missing
// arrival-acknowledgment surface.
export const CEREMONY_BRIDGE_LINE = "your stone is in the world";

// Dismiss prompt. Avoids repeating "see yourself in the world" (the
// Blink button the user just clicked) and avoids "the world" entirely
// (lexicon canon: Observatory is the surface name; "the world" was
// forbidden as a synonym in the ambient/cold-audience surface). The
// next surface (the Plaza) is already showing the world breathing —
// the dismiss doesn't need to sell it. Soft, no urgency.
export const CEREMONY_DISMISS_LINE = "tap when you're ready";

export const STONE_COPY: Record<Element, StoneCopy> = {
  wood: {
    headline: "Wood",
    flavor: [
      "you start things.",
      "this one's real now.",
    ],
    breathDurMs: 6000,
  },
  fire: {
    headline: "Fire",
    flavor: [
      "you moved first.",
      "the room moved with you.",
    ],
    breathDurMs: 4000,
  },
  earth: {
    headline: "Earth",
    flavor: [
      "you stay when others move on.",
      "this room will too.",
    ],
    breathDurMs: 5500,
  },
  metal: {
    headline: "Metal",
    flavor: [
      "you hear what isn't said.",
      "the cut is the gift.",
    ],
    breathDurMs: 4500,
  },
  water: {
    headline: "Water",
    flavor: [
      "you feel before you think.",
      "feel where you've landed.",
    ],
    breathDurMs: 5000,
  },
};

export const STONE_SHOWN_STORAGE_PREFIX = "puru-stone-shown-";

export function stoneShownKey(element: Element): string {
  return `${STONE_SHOWN_STORAGE_PREFIX}${element}`;
}

export function hasStoneCeremonyBeenShown(element: Element): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(stoneShownKey(element)) === "1";
  } catch {
    return false;
  }
}

export function markStoneCeremonyShown(element: Element): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(stoneShownKey(element), "1");
  } catch {
    // quota / disabled — ceremony will replay next visit, not the
    // worst failure mode for a once-and-done celebration
  }
}
