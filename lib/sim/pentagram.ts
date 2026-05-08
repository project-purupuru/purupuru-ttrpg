/**
 * Pentagram geometry — pure functions over wuxing vertex layout.
 *
 * Vertex angles fixed (clockwise from top, 72° spacing) per SDD §3.3:
 *   Wood 270°, Fire 342°, Earth 54°, Metal 126°, Water 198°
 *
 * Pentagon edges (生 generation cycle): Wood→Fire→Earth→Metal→Water→Wood
 * Inner-star edges (克 destruction cycle): Wood→Earth, Fire→Metal,
 *   Earth→Water, Metal→Wood, Water→Fire
 */

import type { Element } from "@/lib/score";
import { ELEMENTS } from "@/lib/score";
import type { PentagramGeometry, Vec2 } from "./types";

const VERTEX_ANGLES_DEG: Record<Element, number> = {
  wood: 270,
  fire: 342,
  earth: 54,
  metal: 126,
  water: 198,
};

const GENERATION_NEXT: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const DESTRUCTION_NEXT: Record<Element, Element> = {
  wood: "earth",
  fire: "metal",
  earth: "water",
  metal: "wood",
  water: "fire",
};

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

export function vertex(element: Element, center: Vec2, radius: number): Vec2 {
  const a = deg2rad(VERTEX_ANGLES_DEG[element]);
  return {
    x: center.x + radius * Math.cos(a),
    y: center.y + radius * Math.sin(a),
  };
}

export function isGenerationEdge(from: Element, to: Element): boolean {
  return GENERATION_NEXT[from] === to || GENERATION_NEXT[to] === from;
}

export function isDestructionEdge(from: Element, to: Element): boolean {
  return DESTRUCTION_NEXT[from] === to || DESTRUCTION_NEXT[to] === from;
}

export function pentagonEdges(): Array<[Element, Element]> {
  return ELEMENTS.map((el) => [el, GENERATION_NEXT[el]] as [Element, Element]);
}

export function innerStarEdges(): Array<[Element, Element]> {
  return ELEMENTS.map((el) => [el, DESTRUCTION_NEXT[el]] as [Element, Element]);
}

/**
 * Affinity-weighted blend across vertices.
 * AC-8 invariant: {wood:100,fire:0,...} → wood vertex; {wood:60,fire:40,...} → t=0.4 along wood→fire edge.
 */
export function affinityBlend(
  affinity: Record<Element, number>,
  center: Vec2,
  radius: number,
): Vec2 {
  const total = ELEMENTS.reduce((sum, el) => sum + affinity[el], 0);
  if (total <= 0) return center;
  let x = 0;
  let y = 0;
  for (const el of ELEMENTS) {
    const w = affinity[el] / total;
    const v = vertex(el, center, radius);
    x += w * v.x;
    y += w * v.y;
  }
  return { x, y };
}

export function createPentagram(center: Vec2, radius: number): PentagramGeometry {
  return {
    center,
    radius,
    vertex(element: Element): Vec2 {
      return vertex(element, center, radius);
    },
    pentagonEdge(from: Element, to: Element): Vec2[] {
      return [vertex(from, center, radius), vertex(to, center, radius)];
    },
    innerStarEdge(from: Element, to: Element): Vec2[] {
      return [vertex(from, center, radius), vertex(to, center, radius)];
    },
    affinityBlend(affinity: Record<Element, number>): Vec2 {
      return affinityBlend(affinity, center, radius);
    },
  };
}
