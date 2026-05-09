"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { activityStream, type ActivityEvent } from "@/lib/activity";
import { ELEMENTS, type Element } from "@/lib/score";
import { OBSERVATORY_SPRITE_COUNT } from "@/lib/sim/entities";
import { buildIdentityRegistry } from "@/lib/sim/identity";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import { PuruhaniAvatar } from "./PuruhaniAvatar";
import { KpiCell } from "./KpiCell";
import { Sparkle, ArrowsClockwise, Compass, UserCircle } from "@phosphor-icons/react";
import type {
  ElementShiftActivity,
  MintActivity,
  QuizCompletedActivity,
  WeatherActivity,
} from "@/lib/activity/types";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

function timeAgo(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  if (diff < 5 * SECOND) return "just now";
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
  return `${Math.floor(diff / MINUTE)}m ago`;
}

// Element-led copy for both row classes · the element is the subject of
// every line. Wallet-bound rows pair this with an identity line above;
// ambient rows stand alone as a single concise beat. Register stays in the
// gumi/canvas register (metaphorical) — the grounded reveal copy lives in
// awareness-branch ARCHETYPE_REVEALS.
//
// Fallback glyphs only render when an actor wallet has no registry entry
// (defensive; rarely hits). Removed from the verb line per clean-text pass.
const WALLET_BOUND_GLYPH: Record<"mint" | "element_shift", string> = {
  mint: "✦",
  element_shift: "⟳",
};

function walletBoundVerb(e: MintActivity | ElementShiftActivity): string {
  if (e.kind === "mint") return "claimed a stone";
  return `drifted to ${e.element}`;
}

function ambientCopy(e: WeatherActivity | QuizCompletedActivity): string {
  if (e.kind === "weather") return `${e.element} breathes today`;
  return `${e.element} emerged`;
}

// Stable per-seed primary used only for identity face/personality.
// Different from sim's distribution-based bucketing on purpose: this
// keeps the archetype face fixed per actor, while the row's element
// (and the avatar body tint) follows the *action*.
function stablePrimaryForSeed(seedIndex: number): Element {
  return ELEMENTS[(seedIndex - 1 + ELEMENTS.length) % ELEMENTS.length];
}

export function ActivityRail() {
  const [events, setEvents] = useState<ActivityEvent[]>(() => activityStream.recent());
  const [now, setNow] = useState<number>(() => Date.now());

  const registry = useMemo(
    () => buildIdentityRegistry(OBSERVATORY_SPRITE_COUNT, stablePrimaryForSeed),
    [],
  );

  useEffect(() => {
    const unsub = activityStream.subscribe((e) => {
      setEvents((prev) => [e, ...prev].slice(0, 50));
    });
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      unsub();
      clearInterval(tick);
    };
  }, []);

  const resolve = (wallet: string): PuruhaniIdentity | null =>
    registry.get(wallet) ?? null;

  // Empty-state value is a single em-dash so the right-hand indicator
  // keeps a stable width — the verbose "awaiting first event" copy
  // lives in the body where width can flex.
  const lastSeen = events.length > 0 ? timeAgo(events[0].at, now) : "—";

  // Live tally over the displayed window — counts only what's in `events`
  // (capped at 50). Reads as "what's happening right now," not lifetime
  // totals; refreshes on every new event without any extra subscription.
  // Weather is rare (5% emit rate) and already carried by the WeatherTile,
  // so the 3-cell counter showcases the high-frequency narrative beats.
  const counts = useMemo(() => {
    let mint = 0;
    let element_shift = 0;
    let quiz_completed = 0;
    for (const e of events) {
      if (e.kind === "mint") mint++;
      else if (e.kind === "element_shift") element_shift++;
      else if (e.kind === "quiz_completed") quiz_completed++;
    }
    return { mint, element_shift, quiz_completed };
  }, [events]);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l border-puru-surface-border bg-puru-cloud-bright shadow-puru-tile">
      <header className="relative shrink-0 bg-puru-cloud-bright px-6 py-4 shadow-[0_1px_0_0_var(--puru-surface-border),0_2px_4px_var(--puru-surface-shadow-sm)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <h3 className="font-puru-display text-xl text-puru-ink-rich">
              Activity
            </h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2.5 font-puru-body text-2xs uppercase tracking-[0.22em] text-puru-ink-dim">
            <span
              className="puru-live-dot inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--puru-wood-vivid)" }}
              aria-hidden
            />
            <span className="inline-block min-w-[5.25em] text-right tabular-nums">
              {lastSeen}
            </span>
          </span>
        </div>
      </header>
      <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-puru-surface-border bg-puru-cloud-base px-3 py-3">
        <KpiCell
          label="mints"
          value={counts.mint}
          aside={<Sparkle weight="fill" />}
        />
        <KpiCell
          label="shifts"
          value={counts.element_shift}
          aside={<ArrowsClockwise weight="bold" />}
        />
        <KpiCell
          label="quizzes"
          value={counts.quiz_completed}
          aside={<Compass weight="fill" />}
        />
      </div>
      {events.length === 0 ? (
        <div className="flex flex-1 items-center justify-center bg-puru-cloud-base px-5 py-12">
          <p className="font-puru-body text-xs uppercase tracking-[0.18em] text-puru-ink-dim">
            awaiting first event
          </p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto overflow-x-hidden bg-puru-cloud-base">
          {events.map((e) => {
            // Element-tinted gradient bg shared across both row classes ·
            // gives the activity its color identity regardless of layout.
            const rowStyle = {
              backgroundImage: `linear-gradient(to left, color-mix(in oklch, var(--puru-${e.element}-vivid) var(--puru-bleed-mix), transparent) 0%, transparent var(--puru-bleed-stop))`,
              color: `var(--puru-${e.element}-vivid)`,
            };

            // Ambient: single concise line · weather (element art) or
            // quiz_completed (greyed user-circle · the user is anonymous,
            // pre-wallet, pre-mint per canonical schema).
            if (e.kind === "weather" || e.kind === "quiz_completed") {
              return (
                <li
                  key={e.id}
                  className="puru-row puru-row-fresh relative flex items-center gap-3 px-5 py-2.5"
                  style={rowStyle}
                >
                  {e.kind === "quiz_completed" ? (
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-puru-cloud-dim/60 text-puru-ink-soft"
                      aria-hidden
                    >
                      <UserCircle weight="regular" size={20} />
                    </span>
                  ) : (
                    <Image
                      src={`/art/elements/${e.element}.png`}
                      alt={e.element}
                      width={32}
                      height={32}
                      className="shrink-0"
                      aria-hidden
                    />
                  )}
                  <p className="min-w-0 flex-1 truncate font-puru-body text-sm leading-tight text-puru-ink-base">
                    {ambientCopy(e)}
                  </p>
                  <span className="shrink-0 font-puru-body text-2xs uppercase tracking-[0.18em] tabular-nums text-puru-ink-dim">
                    {timeAgo(e.at, now)}
                  </span>
                </li>
              );
            }

            // Wallet-bound: 2-line treatment · avatar + identity + verb.
            const actor = resolve(e.actor);
            return (
              <li
                key={e.id}
                className="puru-row puru-row-fresh relative flex items-center gap-3 px-5 py-3"
                style={rowStyle}
              >
                {actor ? (
                  <PuruhaniAvatar
                    seed={actor.pfp}
                    primary={e.element}
                    affinity={e.element}
                    size={40}
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-puru-card text-lg text-puru-cloud-bright"
                    style={{ backgroundColor: `var(--puru-${e.element}-vivid)` }}
                  >
                    {WALLET_BOUND_GLYPH[e.kind]}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-puru-body text-sm leading-tight text-puru-ink-base">
                    <span className="font-puru-display text-xs text-puru-ink-rich">
                      {actor?.displayName ?? e.actor.slice(0, 6)}
                    </span>
                    <span className="ml-1 font-puru-body text-2xs text-puru-ink-dim">
                      @{actor?.username ?? e.actor.slice(2, 8).toLowerCase()}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate font-puru-body text-xs leading-tight text-puru-ink-soft">
                    {walletBoundVerb(e)}
                  </p>
                </div>
                <span className="shrink-0 self-start font-puru-body text-2xs uppercase tracking-[0.18em] tabular-nums text-puru-ink-dim">
                  {timeAgo(e.at, now)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
