// Wedge-target geometry for the stone ceremony's exit migration.
//
// The PentagramCanvas places its 5 element vertices at canvas-local
// coordinates (computed in `lib/sim/pentagram.ts:vertex` from a center
// + radius). The center is `{w/2, h/2}` and the radius is
// `Math.min(w, h) * 0.38` — same formula as `PentagramCanvas.tsx:338-339`.
//
// To migrate the stone from screen-center to its element's wedge, we
// need to project canvas-local coords into viewport coords. This
// helper duplicates the canvas's geometry math (small, stable, ~10
// lines) instead of reaching into the Pixi `Application.screen` —
// the canvas may not be initialized when the ceremony queries (init
// is async at PentagramCanvas:319-336). The DOM container's
// getBoundingClientRect() is always available once mounted.
//
// Per ALEXANDER spatial audit 2026-05-11:
//   - the rotateX(6deg) wrapper at PentagramCanvas:816 foreshortens
//     y-coords ~0.6% — invisible at 720ms migration, ignore
//   - snapshot on tap is correct for the 720ms window; resize during
//     ceremony is a rare edge case (deferred to a future arming
//     ResizeObserver if it becomes a real problem)

import type { Element } from "@/lib/score";
import { vertex as pentagramVertex } from "@/lib/sim/pentagram";

const RADIUS_MULTIPLIER = 0.38;

export interface ViewportPoint {
  x: number;
  y: number;
}

/**
 * Resolve the viewport-coordinate position of an element's wedge
 * vertex on the live PentagramCanvas. Returns null if the canvas
 * pane element isn't mounted or has zero size.
 *
 * The returned point is in viewport (`fixed`) coordinate space, so
 * it can be used directly by a fixed-positioned overlay element
 * to compute its translate target.
 */
export function resolveWedgeViewportPoint(
  pentagramPaneEl: Element_DOM | null,
  element: Element,
): ViewportPoint | null {
  if (!pentagramPaneEl) return null;
  const rect = pentagramPaneEl.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  // Match PentagramCanvas:338-339 verbatim — the canvas's internal
  // geometry is built from app.screen which equals the host's CSS
  // box (Pixi's `resizeTo: host`).
  const localCenter = { x: rect.width / 2, y: rect.height / 2 };
  const radius = Math.min(rect.width, rect.height) * RADIUS_MULTIPLIER;

  const vertex = pentagramVertex(element, localCenter, radius);

  return {
    x: rect.left + vertex.x,
    y: rect.top + vertex.y,
  };
}

// DOM Element type alias — distinguishes from the wuxing Element
// type imported above. Exported under `Element_DOM` so the call
// site doesn't have to disambiguate at the import.
type Element_DOM = HTMLElement;
