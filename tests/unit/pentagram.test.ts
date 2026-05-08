import { describe, expect, it } from "vitest";
import {
  affinityBlend,
  createPentagram,
  innerStarEdges,
  pentagonEdges,
  vertex,
} from "@/lib/sim/pentagram";

const CENTER = { x: 0, y: 0 };
const RADIUS = 100;

describe("pentagram geometry", () => {
  it("places wood at the top vertex (270°)", () => {
    const v = vertex("wood", CENTER, RADIUS);
    expect(v.x).toBeCloseTo(0, 5);
    expect(v.y).toBeCloseTo(-RADIUS, 5);
  });

  it("places fire upper-right (342°)", () => {
    const v = vertex("fire", CENTER, RADIUS);
    expect(v.x).toBeGreaterThan(0);
    expect(v.y).toBeLessThan(0);
  });

  it("emits 5 pentagon edges in the generation cycle", () => {
    const edges = pentagonEdges();
    expect(edges).toHaveLength(5);
    expect(edges).toContainEqual(["wood", "fire"]);
    expect(edges).toContainEqual(["fire", "earth"]);
    expect(edges).toContainEqual(["earth", "metal"]);
    expect(edges).toContainEqual(["metal", "water"]);
    expect(edges).toContainEqual(["water", "wood"]);
  });

  it("emits 5 inner-star edges in the destruction cycle", () => {
    const edges = innerStarEdges();
    expect(edges).toHaveLength(5);
    expect(edges).toContainEqual(["wood", "earth"]);
    expect(edges).toContainEqual(["fire", "metal"]);
    expect(edges).toContainEqual(["earth", "water"]);
    expect(edges).toContainEqual(["metal", "wood"]);
    expect(edges).toContainEqual(["water", "fire"]);
  });
});

describe("affinityBlend (PRD §4 F4.7, AC-8)", () => {
  it("100% wood resolves to the wood vertex", () => {
    const blended = affinityBlend(
      { wood: 100, fire: 0, earth: 0, water: 0, metal: 0 },
      CENTER,
      RADIUS,
    );
    const wood = vertex("wood", CENTER, RADIUS);
    expect(blended.x).toBeCloseTo(wood.x, 5);
    expect(blended.y).toBeCloseTo(wood.y, 5);
  });

  it("60/40 wood/fire lies on the wood→fire pentagon edge at t=0.4", () => {
    const blended = affinityBlend(
      { wood: 60, fire: 40, earth: 0, water: 0, metal: 0 },
      CENTER,
      RADIUS,
    );
    const wood = vertex("wood", CENTER, RADIUS);
    const fire = vertex("fire", CENTER, RADIUS);
    const expected = {
      x: wood.x + 0.4 * (fire.x - wood.x),
      y: wood.y + 0.4 * (fire.y - wood.y),
    };
    expect(blended.x).toBeCloseTo(expected.x, 5);
    expect(blended.y).toBeCloseTo(expected.y, 5);
  });

  it("balanced 20/20/20/20/20 resolves near the pentagram center", () => {
    const blended = affinityBlend(
      { wood: 20, fire: 20, earth: 20, water: 20, metal: 20 },
      CENTER,
      RADIUS,
    );
    expect(blended.x).toBeCloseTo(0, 5);
    expect(blended.y).toBeCloseTo(0, 5);
  });

  it("zero affinity falls back to center (defensive)", () => {
    const blended = affinityBlend(
      { wood: 0, fire: 0, earth: 0, water: 0, metal: 0 },
      CENTER,
      RADIUS,
    );
    expect(blended).toEqual(CENTER);
  });

  it("∀ valid affinity, blended position lies within the pentagram bounding circle", () => {
    const samples: Array<Record<"wood" | "fire" | "earth" | "water" | "metal", number>> = [
      { wood: 100, fire: 0, earth: 0, water: 0, metal: 0 },
      { wood: 50, fire: 25, earth: 12, water: 8, metal: 5 },
      { wood: 33, fire: 33, earth: 34, water: 0, metal: 0 },
      { wood: 1, fire: 1, earth: 1, water: 1, metal: 96 },
    ];
    for (const a of samples) {
      const p = affinityBlend(a, CENTER, RADIUS);
      const r = Math.hypot(p.x - CENTER.x, p.y - CENTER.y);
      expect(r).toBeLessThanOrEqual(RADIUS + 1e-6);
    }
  });
});

describe("PentagramGeometry interface", () => {
  it("createPentagram returns a closure over center+radius", () => {
    const g = createPentagram({ x: 50, y: 50 }, 200);
    expect(g.center).toEqual({ x: 50, y: 50 });
    expect(g.radius).toBe(200);
    const wood = g.vertex("wood");
    expect(wood.x).toBeCloseTo(50, 5);
    expect(wood.y).toBeCloseTo(50 - 200, 5);
  });
});
