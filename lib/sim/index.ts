// Sim system · the in-world entity layer.
//
// Suffix-as-type convention (substrate-ECS cycle 2026-05-11):
//   *.system.ts  — Effect-shaped pipelines over components / archetypes
//   (others)     — domain primitives, geometry, identity
//
// Existing consumers deep-import; this barrel is the grep-enumerable
// surface for external readers and AI agents.
export * from "./entities";
export * from "./population.system";
export * from "./pentagram";
export * from "./tides";
export * from "./identity";
export * as Avatar from "./avatar";
export * from "./types";
