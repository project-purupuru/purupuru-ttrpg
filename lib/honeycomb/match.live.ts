/**
 * Match.live — phase-orchestrator implementation.
 *
 * Sits above Battle (selection/arrangement state) and Clash (round resolution).
 * Drives the full match lifecycle defined by MatchPhase. SDD §3.3.
 *
 * Phase × Command transition matrix is enforced via validCommandsFor() from
 * the port. Wrong-phase commands return a typed `wrong-phase` error.
 */

import { Effect, Layer, PubSub, Ref, Stream } from "effect";
import { Clash } from "./clash.port";
import { type Card, CARD_DEFINITIONS, createCard } from "./cards";
import { detectCombos, getComboSummary } from "./combos";
import { CONDITIONS, type BattleCondition } from "./conditions";
import {
  Match,
  type MatchCommand,
  type MatchError,
  type MatchEvent,
  type MatchPhase,
  type MatchSnapshot,
  validCommandsFor,
} from "./match.port";
import { rngFromSeed } from "./seed";
import { ELEMENT_ORDER, type Element, getDailyElement } from "./wuxing";

function initialSnapshot(seed: string): MatchSnapshot {
  const rng = rngFromSeed(seed);
  const weather = getDailyElement();
  const opponentElement: Element = rng.pick(ELEMENT_ORDER);
  const condition: BattleCondition = CONDITIONS[opponentElement];
  const collection: Card[] = Array.from({ length: 12 }, (_, i) =>
    createCard(rng.pick(CARD_DEFINITIONS), new Date(2026, 4, 12 + i)),
  );
  return {
    phase: "idle",
    seed,
    weather,
    opponentElement,
    condition,
    playerElement: null,
    hasSeenTutorial: false,
    collection,
    selectedIndices: [],
    p1Lineup: [],
    p2Lineup: [],
    currentRound: 0,
    rounds: [],
    winner: null,
    p1Combos: [],
    p2Combos: [],
    chainBonusAtRoundStart: 0,
  };
}

/** Sample 5 cards from collection deterministically for stub p2 opponent.
 * Replaced by real Opponent service in S1b.
 */
function stubOpponentLineup(snap: MatchSnapshot): Card[] {
  const rng = rngFromSeed(`${snap.seed}|opponent`);
  return Array.from({ length: 5 }, () =>
    createCard(rng.pick(CARD_DEFINITIONS), new Date(2026, 4, 13)),
  );
}

export const MatchLive: Layer.Layer<Match, never, Clash> = Layer.scoped(
  Match,
  Effect.gen(function* () {
    const clash = yield* Clash;
    const stateRef = yield* Ref.make<MatchSnapshot>(initialSnapshot("match-genesis"));
    const pubsub = yield* PubSub.unbounded<MatchEvent>();

    const publish = (event: MatchEvent) => PubSub.publish(pubsub, event);

    const transition = (phase: MatchPhase): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* Ref.update(stateRef, (s) => ({ ...s, phase }));
        yield* publish({ _tag: "phase-entered", phase, at: Date.now() });
      });

    const ensurePhase = (snap: MatchSnapshot, cmd: MatchCommand): Effect.Effect<void, MatchError> =>
      Effect.gen(function* () {
        const valid = validCommandsFor(snap.phase);
        if (!valid.includes(cmd._tag)) {
          // Find phases that DO accept this command (for error message)
          const allPhases: MatchPhase[] = [
            "idle",
            "entry",
            "quiz",
            "select",
            "arrange",
            "committed",
            "clashing",
            "disintegrating",
            "between-rounds",
            "result",
          ];
          const expected = allPhases.filter((p) => validCommandsFor(p).includes(cmd._tag));
          return yield* Effect.fail({
            _tag: "wrong-phase",
            current: snap.phase,
            expected,
          } as const);
        }
      });

    const invoke = (cmd: MatchCommand): Effect.Effect<void, MatchError> =>
      Effect.gen(function* () {
        const snap = yield* Ref.get(stateRef);
        yield* ensurePhase(snap, cmd);

        switch (cmd._tag) {
          case "begin-match": {
            const next = initialSnapshot(cmd.seed ?? snap.seed);
            const ready: MatchSnapshot = { ...next, phase: "entry" };
            yield* Ref.set(stateRef, ready);
            yield* publish({ _tag: "phase-entered", phase: "entry", at: Date.now() });
            return;
          }
          case "choose-element": {
            yield* Ref.update(stateRef, (s) => ({
              ...s,
              playerElement: cmd.element,
            }));
            yield* publish({ _tag: "player-element-chosen", element: cmd.element });
            // After choosing, transition to select.
            yield* transition("select");
            return;
          }
          case "complete-tutorial": {
            yield* Ref.update(stateRef, (s) => ({ ...s, hasSeenTutorial: true }));
            yield* publish({ _tag: "tutorial-completed" });
            return;
          }
          case "lock-in": {
            // Build lineups
            const p1Lineup =
              snap.selectedIndices.length === 5
                ? snap.selectedIndices.map((i) => snap.collection[i]!).filter(Boolean)
                : snap.p1Lineup;

            const p2Lineup = snap.p2Lineup.length === 0 ? stubOpponentLineup(snap) : snap.p2Lineup;

            const p1Combos = detectCombos(p1Lineup, { weather: snap.weather });
            const p2Combos = detectCombos(p2Lineup, { weather: snap.weather });

            yield* Ref.update(stateRef, (s) => ({
              ...s,
              p1Lineup,
              p2Lineup,
              p1Combos,
              p2Combos,
            }));

            yield* publish({ _tag: "lineups-locked" });
            yield* transition("committed");
            return;
          }
          case "advance-clash": {
            // Resolve current round
            const round = snap.currentRound + 1;
            const result = yield* clash.resolveRound({
              p1Lineup: snap.p1Lineup,
              p2Lineup: snap.p2Lineup,
              weather: snap.weather,
              condition: snap.condition,
              round,
              seed: snap.seed,
              p1CombosAtRoundStart: snap.p1Combos,
              p2CombosAtRoundStart: snap.p2Combos,
              previousChainBonus: snap.chainBonusAtRoundStart,
            });

            yield* publish({ _tag: "clash-resolved", result });

            // Recompute survivors
            const newP1 = result.survivors.p1;
            const newP2 = result.survivors.p2;
            const newP1Combos = detectCombos(newP1, { weather: snap.weather });
            const newP2Combos = detectCombos(newP2, { weather: snap.weather });
            const summary = getComboSummary(newP1Combos);

            yield* Ref.update(stateRef, (s) => ({
              ...s,
              p1Lineup: newP1,
              p2Lineup: newP2,
              currentRound: round,
              rounds: [...s.rounds, result],
              p1Combos: newP1Combos,
              p2Combos: newP2Combos,
              chainBonusAtRoundStart: result.gardenGraceFired
                ? result.chainBonusAtRoundEnd
                : summary.totalBonus,
            }));

            yield* publish({
              _tag: "round-ended",
              round,
              eliminated: result.eliminated,
            });

            // Determine match continuation
            if (newP1.length === 0 && newP2.length === 0) {
              yield* Ref.update(stateRef, (s): MatchSnapshot => ({ ...s, winner: "draw" }));
              yield* publish({ _tag: "match-completed", winner: "draw" });
              yield* transition("result");
            } else if (newP1.length === 0) {
              yield* Ref.update(stateRef, (s): MatchSnapshot => ({ ...s, winner: "p2" }));
              yield* publish({ _tag: "match-completed", winner: "p2" });
              yield* transition("result");
            } else if (newP2.length === 0) {
              yield* Ref.update(stateRef, (s): MatchSnapshot => ({ ...s, winner: "p1" }));
              yield* publish({ _tag: "match-completed", winner: "p1" });
              yield* transition("result");
            } else {
              yield* transition("disintegrating");
            }
            return;
          }
          case "advance-round": {
            yield* transition("between-rounds");
            return;
          }
          case "reset-match": {
            const next = initialSnapshot(cmd.seed ?? `match-${Date.now()}`);
            yield* Ref.set(stateRef, next);
            yield* publish({ _tag: "phase-entered", phase: "idle", at: Date.now() });
            return;
          }
        }
      });

    return Match.of({
      current: Ref.get(stateRef),
      events: Stream.fromPubSub(pubsub),
      invoke,
    });
  }),
);
