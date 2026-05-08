"use client";

import { useEffect, useMemo, useState } from "react";
import { activityStream, type ActivityEvent } from "@/lib/activity";
import { ELEMENTS, type Element } from "@/lib/score";
import { OBSERVATORY_SPRITE_COUNT } from "@/lib/sim/entities";
import { buildIdentityRegistry } from "@/lib/sim/identity";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import { PuruhaniAvatar } from "./PuruhaniAvatar";

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

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l border-puru-surface-border bg-puru-cloud-bright shadow-puru-tile">
      <header className="relative shrink-0 bg-puru-cloud-bright px-6 py-5 shadow-[0_1px_0_0_var(--puru-surface-border),0_2px_4px_var(--puru-surface-shadow-sm)]">
        <h3 className="font-puru-display text-xl text-puru-ink-rich">
          Recent activity
        </h3>
      </header>
      {events.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <p className="font-puru-mono text-xs uppercase tracking-[0.18em] text-puru-ink-dim">
            awaiting first event
          </p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-puru-cloud-dim/70 overflow-y-auto overflow-x-hidden">
          {events.map((e) => {
            const actor = resolve(e.actor);
            const target = e.target ? resolve(e.target) : null;
            return (
              <li
                key={e.id}
                className="puru-row relative flex items-center gap-3 px-5 py-3"
                style={{
                  backgroundImage: `linear-gradient(to left, color-mix(in oklch, var(--puru-${e.element}-vivid) 12%, transparent) 0%, transparent 55%)`,
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
                  <p className="truncate font-puru-body text-sm leading-tight">
                    <span className="font-puru-card text-puru-ink-rich">
                      {actor?.displayName ?? e.actor.slice(0, 6)}
                    </span>
                    <span className="ml-1 font-puru-mono text-2xs text-puru-ink-dim">
                      @{actor?.username ?? e.actor.slice(2, 8).toLowerCase()}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate font-puru-mono text-xs leading-tight text-puru-ink-soft">
                    <span aria-hidden className="mr-1">{KIND_GLYPH[e.kind]}</span>
                    {KIND_LABEL[e.kind]}
                    {target ? (
                      <span className="ml-1 text-puru-ink-base">{target.displayName}</span>
                    ) : null}
                  </p>
                </div>
                <span className="shrink-0 self-start font-puru-mono text-2xs uppercase tracking-[0.18em] text-puru-ink-dim">
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
