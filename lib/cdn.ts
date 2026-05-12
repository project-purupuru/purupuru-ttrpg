/**
 * CDN — mirrors the world-purupuru cdn map exactly so compass uses the same
 * source-of-truth scene/character/card art via the public S3 bucket.
 *
 * Set NEXT_PUBLIC_CDN_BASE to override; default is the public S3 origin
 * (no credentials required, GET-only).
 */

export const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_BASE ?? "https://thj-assets.s3.us-west-2.amazonaws.com/Purupuru";

function safe(path: string): string {
  return path.replace(/^\/+/, "").replace(/\.\./g, "");
}

export function cdn(path: string): string {
  return `${CDN_BASE}/${safe(path)}`;
}

/** World scenes — bus-stop atmosphere per element + time of day. */
export const WORLD_SCENES: Record<string, string> = {
  wood: cdn("scenes/bus-stop-spring-day.png"),
  fire: cdn("scenes/tsuheji-bus-stop-sunset.png"),
  earth: cdn("scenes/tsuheji-bus-stop-bright-day.png"),
  metal: cdn("scenes/tsuheji-bus-stop-night.png"),
  water: cdn("scenes/bus-stop-rainy-day.png"),
};

/** Per-element scene labels — the place names shown on the quiz card. */
export const WORLD_SCENE_LABELS: Record<string, string> = {
  wood: "Tsuheji bus stop · spring",
  fire: "Tsuheji bus stop · sunset",
  earth: "Tsuheji bus stop · daylight",
  metal: "Tsuheji bus stop · night",
  water: "Tsuheji bus stop · rain",
};

/** Caretaker full-body — transparent renders for battle speakers and quiz murals. */
export const CARETAKER_FULL: Record<string, string> = {
  wood: cdn("caretakers/caretaker-kaori-fullbody.png"),
  fire: cdn("caretakers/caretaker-akane-fullbody.png"),
  earth: cdn("caretakers/caretaker-nemu-fullbody.png"),
  metal: cdn("caretakers/caretaker-ren-fullbody.png"),
  water: cdn("caretakers/caretaker-ruan-fullbody.png"),
};

/** Pre-composed saturated card faces — used in BattleHand directly. */
export const CARD_SATURATED: Record<string, string> = {
  wood: cdn("cards/wood-caretaker-kaori-card-saturated.png"),
  fire: cdn("cards/fire-caretaker-akane-card-saturated.png"),
  earth: cdn("cards/earth-caretaker-nemu-card-saturated.png"),
  metal: cdn("cards/metal-caretaker-ren-card-saturated.png"),
  water: cdn("cards/water-caretaker-ruan-card-saturated.png"),
};

/** Pastel-frame variants. */
export const CARD_PASTEL: Record<string, string> = {
  wood: cdn("cards/wood-caretaker-kaori-card-pastel.png"),
  fire: cdn("cards/fire-caretaker-akane-card-pastel.png"),
  earth: cdn("cards/earth-caretaker-nemu-card-pastel.png"),
  metal: cdn("cards/metal-caretaker-ren-card-pastel.png"),
  water: cdn("cards/water-caretaker-ruan-card-pastel.png"),
};

/** Caretaker-portrait card art panel — the art-window asset for ComposedCard. */
export const CARD_ART_PANELS: Record<string, string> = {
  wood: cdn("cards/caretaker-kaori-wood-card.png"),
  fire: cdn("cards/caretaker-akane-fire-card.png"),
  earth: cdn("cards/caretaker-nemu-earth-card.png"),
  metal: cdn("cards/caretaker-ren-metal-card.png"),
  water: cdn("cards/caretaker-ruan-water-card.png"),
};

/** Jani trading-card composites (Pokémon-style). */
export const JANI_CARDS: Record<string, string> = {
  wood: cdn("cards/jani-trading-card-wood.png"),
  fire: cdn("cards/jani-trading-card-fire.png"),
  earth: cdn("cards/jani-trading-card-earth.png"),
  metal: cdn("cards/jani-trading-card-metal.png"),
  water: cdn("cards/jani-trading-card-water.png"),
};

/** Tsuheji map texture — the underlying terrain for backdrop mode. */
export const WORLD_MAP_TEXTURE = "/art/tsuheji-map.png"; // local, ships with repo
