"use client";

import { useEffect, useMemo, useState } from "react";
import { activityStream, type ActivityEvent } from "@/lib/activity";
import { ELEMENTS, type Element } from "@/lib/score";
import { OBSERVATORY_SPRITE_COUNT } from "@/lib/sim/entities";
import { buildIdentityRegistry } from "@/lib/sim/identity";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import { PuruhaniAvatar } from "./PuruhaniAvatar";
import type { ActionKind } from "@/lib/activity/types";
import { KpiCell } from "./KpiCell";
import { Sparkle, Sword, Flower } from "@phosphor-icons/react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

function timeAgo(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  if (diff < 5 * SECOND) return "just now";
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
  return `${Math.floor(diff / MINUTE)}m ago`;
}

const KIND_LABEL = {
  mint: "minted",
  attack: "attacked",
  gift: "gifted",
} as const;

const KIND_GLYPH = {
  mint: "✦",
  attack: "⚔",
  gift: "❀",
} as const;

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
  const counts = useMemo(() => {
    const c: Record<ActionKind, number> = { mint: 0, attack: 0, gift: 0 };
    for (const e of events) c[e.kind]++;
    return c;
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
          label="attacks"
          value={counts.attack}
          aside={<Sword weight="fill" />}
        />
        <KpiCell
          label="gifts"
          value={counts.gift}
          aside={<Flower weight="fill" />}
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
            const actor = resolve(e.actor);
            const target = e.target ? resolve(e.target) : null;
            return (
              <li
                key={e.id}
                className="puru-row puru-row-fresh relative flex items-center gap-3 px-5 py-3"
                style={{
                  backgroundImage: `linear-gradient(to left, color-mix(in oklch, var(--puru-${e.element}-vivid) var(--puru-bleed-mix), transparent) 0%, transparent var(--puru-bleed-stop))`,
                  color: `var(--puru-${e.element}-vivid)`,
                }}
              >
                {actor ? (
                  <PuruhaniAvatar
                    seed={actor.pfp}
                    primary={e.element}
                    affinity={e.targetElement ?? e.element}
                    size={40}
                  />
                ) : (
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-puru-card text-lg text-puru-cloud-bright"
                    style={{ backgroundColor: `var(--puru-${e.element}-vivid)` }}
                  >
                    {KIND_GLYPH[e.kind]}
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
                    <span aria-hidden className="mr-1">{KIND_GLYPH[e.kind]}</span>
                    {KIND_LABEL[e.kind]}
                    {target ? (
                      <span className="ml-1 text-puru-ink-base">{target.displayName}</span>
                    ) : null}
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
