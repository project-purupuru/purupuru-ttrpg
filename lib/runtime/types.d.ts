/**
 * Runtime type augmentations.
 *
 * Dev-panel surface is exposed on globalThis under `__PURU_DEV__` so the
 * Playwright visual tests (and ad-hoc DevTools sessions) can inject seeded
 * snapshots without going through the React tree.
 *
 * Gated by NODE_ENV !== "production" — the dev panel removes itself from the
 * production bundle entirely.
 */

import type { MatchSnapshot } from "@/lib/honeycomb/match.port";

declare global {
  // eslint-disable-next-line no-var
  var __PURU_DEV__:
    | {
        readonly enabled: boolean;
        readonly injectSnapshot: (patch: Partial<MatchSnapshot>) => void;
        readonly forcePhase: (phase: MatchSnapshot["phase"]) => void;
      }
    | undefined;
}

export {};
