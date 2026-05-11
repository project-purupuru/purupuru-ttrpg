import { Schema } from "effect";

// Presentation-side element vocabulary (lowercase). Substrate truth at
// packages/peripheral-events uses the uppercase variant for on-chain
// alignment — translation happens at boundaries, not via lookup duplication.
export const Element = Schema.Literal("wood", "fire", "earth", "metal", "water");
export type Element = Schema.Schema.Type<typeof Element>;

export const ELEMENTS: readonly Element[] = ["wood", "fire", "earth", "metal", "water"];

export const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

export const ELEMENT_BREATH_MS: Record<Element, number> = {
  wood: 6000,
  fire: 4000,
  earth: 5500,
  metal: 4500,
  water: 5000,
};

export const ELEMENT_HUE: Record<Element, number> = {
  wood: 113,
  fire: 28,
  earth: 84,
  metal: 310,
  water: 266,
};
