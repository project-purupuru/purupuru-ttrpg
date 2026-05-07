export type {
  Element,
  ElementDistribution,
  EcosystemEnergy,
  ScoreReadAdapter,
  Wallet,
  WalletBadge,
  WalletProfile,
  WalletSignals,
} from "./types";
export { ELEMENTS } from "./types";
export { mockScoreAdapter } from "./mock";

import { mockScoreAdapter } from "./mock";
import type { ScoreReadAdapter } from "./types";

export const scoreAdapter: ScoreReadAdapter = mockScoreAdapter;
