export type ElementId = "wood" | "fire" | "earth" | "metal" | "water";

/** 時辰 (shichen) — current element based on time of day */
export function timeElementId(): ElementId {
  const h = new Date().getHours();
  if (h >= 5 && h < 9) return "wood";
  if (h >= 9 && h < 13) return "fire";
  if (h >= 13 && h < 17) return "earth";
  if (h >= 17 && h < 21) return "metal";
  return "water";
}
