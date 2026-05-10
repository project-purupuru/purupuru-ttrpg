// Mirror of project-purupuru/world-purupuru sites/world/src/lib/cdn.ts
// (TypeScript-only port; no Svelte deps. Hotlinks the public S3 + Vercel
// thumb CDN. Used by /asset-test to preview which assets to pull into the
// observatory.)

export const CDN_BASE = "https://thj-assets.s3.us-west-2.amazonaws.com/Purupuru";
export const THUMB_BASE = "https://purupuru.world";

const cdn = (p: string) => `${CDN_BASE}/${p}`;
const thumb = (p: string) => `${THUMB_BASE}${p.startsWith("/") ? "" : "/"}${p}`;

export type ElementId = "wood" | "fire" | "earth" | "metal" | "water";
export const ELEMENT_IDS: ElementId[] = ["wood", "fire", "earth", "metal", "water"];

export const KANJI: Record<ElementId, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

export const BRAND = {
  logo: cdn("brand/project-purupuru-logo.png"),
  wordmark: cdn("brand/purupuru-wordmark.svg"),
  logoCardBack: cdn("brand/project-purupuru-logo-card-back.png"),
} as const;

export const CELESTIAL = {
  sun: cdn("icons/sun-icon.png"),
  moon: cdn("icons/moon-and-clouds-icon.png"),
} as const;

export const ELEMENT_ICONS: Record<ElementId, string> = {
  wood: cdn("icons/wood-element-sprout-icon.png"),
  fire: cdn("icons/fire-element-flame-icon.png"),
  earth: cdn("icons/earth-element-sun-icon.png"),
  metal: cdn("icons/jani-metal-element-face.png"),
  water: cdn("icons/water-element-drop-icon.png"),
};

export const ELEMENT_ICONS_THUMB: Record<ElementId, string> = {
  wood: thumb("/thumbs/icons/wood-element-sprout-icon.webp"),
  fire: thumb("/thumbs/icons/fire-element-flame-icon.webp"),
  earth: thumb("/thumbs/icons/earth-element-sun-icon.webp"),
  metal: thumb("/thumbs/icons/jani-metal-element-face.webp"),
  water: thumb("/thumbs/icons/water-element-drop-icon.webp"),
};

export const BEAR_FACES: Record<ElementId, string> = {
  wood: cdn("icons/wood-bear-face-panda-grey.png"),
  fire: cdn("icons/black-bear-face.png"),
  earth: cdn("icons/earth-bear-face-brown.png"),
  metal: cdn("icons/polar-bear-face-simplified.png"),
  water: cdn("icons/red-panda-face.png"),
};

export const JANI_GUARDIAN: Record<ElementId, string> = {
  wood: cdn("jani/jani-wood-face.png"),
  fire: cdn("jani/jani-fire-face.png"),
  earth: cdn("jani/jani-earth-face.png"),
  metal: cdn("jani/jani-metal-face.png"),
  water: cdn("jani/jani-water-face.png"),
};

export const JANI_GUARDIAN_THUMB: Record<ElementId, string> = {
  wood: thumb("/thumbs/jani/jani-wood-face.webp"),
  fire: thumb("/thumbs/jani/jani-fire-face.webp"),
  earth: thumb("/thumbs/jani/jani-earth-face.webp"),
  metal: thumb("/thumbs/jani/jani-metal-face.webp"),
  water: thumb("/thumbs/jani/jani-water-face.webp"),
};

export const JANI_ELEMENTAL: Record<ElementId, string> = {
  wood: cdn("jani/jani-wood-variant.png"),
  fire: cdn("jani/jani-fire-variant.png"),
  earth: cdn("jani/jani-earth-variant.png"),
  metal: cdn("jani/jani-metal-variant.png"),
  water: cdn("jani/jani-water-variant.png"),
};

export const CARETAKER_NAMES: Record<ElementId, string> = {
  wood: "Kaori",
  fire: "Akane",
  earth: "Nemu",
  metal: "Ren",
  water: "Ruan",
};

export const CARETAKER_CHIBI: Record<ElementId, string> = {
  wood: cdn("caretakers/caretaker-kaori-pfp-earth-pastel.png"),
  fire: cdn("caretakers/caretaker-akane-pfp-fire-pastel.png"),
  earth: cdn("caretakers/caretaker-nemu-pfp-wood-pastel.png"),
  metal: cdn("caretakers/caretaker-ren-pfp-metal-pastel.png"),
  water: cdn("caretakers/caretaker-ruan-pfp-water-pastel.png"),
};

export const CARETAKER_ART_THUMB: Record<ElementId, string> = {
  wood: thumb("/thumbs/caretakers/caretaker-kaori-pose.webp"),
  fire: thumb("/thumbs/caretakers/caretaker-akane-puruhani-chibi.webp"),
  earth: thumb("/thumbs/caretakers/caretaker-nemu-earth.webp"),
  metal: thumb("/thumbs/caretakers/caretaker-ren-with-puruhani.webp"),
  water: thumb("/thumbs/caretakers/caretaker-ruan-cute-pose.webp"),
};

export const CARETAKER_FULL: Record<ElementId, string> = {
  wood: cdn("caretakers/caretaker-kaori-fullbody.png"),
  fire: cdn("caretakers/caretaker-akane-fullbody.png"),
  earth: cdn("caretakers/caretaker-nemu-fullbody.png"),
  metal: cdn("caretakers/caretaker-ren-fullbody.png"),
  water: cdn("caretakers/caretaker-ruan-fullbody.png"),
};

export const CARETAKER_SCENES_HD: Record<ElementId, string> = {
  wood: thumb("/thumbs/scenes/caretaker-kaori-gardening-with-puruhani-hd.webp"),
  fire: thumb("/thumbs/scenes/caretaker-akane-with-puruhani-at-bus-stop-hd.webp"),
  earth: thumb("/thumbs/scenes/caretaker-nemu-puruhani-spring-hd.webp"),
  metal: thumb("/thumbs/scenes/caretaker-ren-puruhani-night-scene-hd.webp"),
  water: thumb("/thumbs/scenes/caretaker-ruan-with-puruhani-in-rain-hd.webp"),
};

export const WORLD_SCENES: Record<ElementId, string> = {
  wood: cdn("scenes/bus-stop-spring-day.png"),
  fire: cdn("scenes/tsuheji-bus-stop-sunset.png"),
  earth: cdn("scenes/tsuheji-bus-stop-bright-day.png"),
  metal: cdn("scenes/tsuheji-bus-stop-night.png"),
  water: cdn("scenes/bus-stop-rainy-day.png"),
};

export const GROUP_ART = {
  caretakersWaiting: cdn("scenes/caretakers-waiting-at-station.png"),
  caretakersPuruhani: cdn("scenes/caretakers-puruhani-card-lineup.png"),
  caretakersChibi: cdn("scenes/kizuna-caretakers-chibi-group.png"),
  bearsGathering: cdn("scenes/henlo-bears-elemental-gathering.png"),
} as const;

export const WORLD_MAP = cdn("scenes/tsuheji-world-map.png");

export const BOARDING_PASSES: Partial<Record<ElementId, string>> = {
  fire: cdn("brand/boarding-pass-fire-jani.png"),
  earth: cdn("brand/boarding-pass-earth-jani-terrain.png"),
  metal: cdn("brand/boarding-pass-metal.png"),
  water: cdn("brand/boarding-pass-water-jani.png"),
};

export const CARD_SATURATED: Record<ElementId, string> = {
  wood: cdn("cards/wood-caretaker-kaori-card-saturated.png"),
  fire: cdn("cards/fire-caretaker-akane-card-saturated.png"),
  earth: cdn("cards/earth-caretaker-nemu-card-saturated.png"),
  metal: cdn("cards/metal-caretaker-ren-card-saturated.png"),
  water: cdn("cards/water-caretaker-ruan-card-saturated.png"),
};

export const CARD_PASTEL: Record<ElementId, string> = {
  wood: cdn("cards/wood-caretaker-kaori-card-pastel.png"),
  fire: cdn("cards/fire-caretaker-akane-card-pastel.png"),
  earth: cdn("cards/earth-caretaker-nemu-card-pastel.png"),
  metal: cdn("cards/metal-caretaker-ren-card-pastel.png"),
  water: cdn("cards/water-caretaker-ruan-card-pastel.png"),
};

export const JANI_CARDS: Partial<Record<ElementId, string>> = {
  wood: cdn("cards/jani-trading-card-wood.png"),
  fire: cdn("cards/jani-trading-card-fire.png"),
  metal: cdn("cards/jani-trading-card-metal.png"),
  water: cdn("cards/jani-trading-card-water.png"),
};

export const PURUHANI_ART_THUMB: Record<ElementId, string> = {
  wood: thumb("/thumbs/puruhani/puruhani-wood.webp"),
  fire: thumb("/thumbs/puruhani/puruhani-fire.webp"),
  earth: thumb("/thumbs/puruhani/puruhani-earth.webp"),
  metal: thumb("/thumbs/puruhani/puruhani-metal.webp"),
  water: thumb("/thumbs/puruhani/puruhani-water.webp"),
};

export const TEXTURES = {
  grain: cdn("patterns/grain-warm.webp"),
  cosmos: cdn("patterns/cosmos-stars.webp"),
  foil: cdn("patterns/foil-warm.webp"),
} as const;
