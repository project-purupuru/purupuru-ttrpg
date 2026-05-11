"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { activityStream, type ActivityEvent } from "@/lib/activity";
import { populationStore } from "@/lib/sim/population";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import { PuruhaniAvatar } from "./PuruhaniAvatar";

// Uniform leading icon slot · all rows share this size so text starts
// at the same x-coordinate.
const ICON_SIZE = 40;

const SECOND = 1000;
const MINUTE = 60 * SECOND;

function timeAgo(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  if (diff < 5 * SECOND) return "just now";
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
  return `${Math.floor(diff / MINUTE)}m ago`;
}

const titleCase = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// "Earth" takes "an"; the other four elements start with consonant sounds.
const indefiniteArticle = (el: string): string => (el === "earth" ? "an" : "a");

export function ActivityRail() {
  const [events, setEvents] = useState<ActivityEvent[]>(() => activityStream.recent());
  const [now, setNow] = useState<number>(() => Date.now());

  // YOU detection is now driven by the connected Solana wallet. When a
  // radar mint arrives with `actor === connectedWallet`, the rail
  // renders the YOU badge in place of the @handle. Pre-connect, no
  // events are flagged. (Mock populationStore spawns won't ever match
  // a real wallet, so they're naturally never YOU under this scheme.)
  const { publicKey } = useWallet();
  const connectedWallet = publicKey?.toBase58() ?? null;

  useEffect(() => {
    const unsub = activityStream.subscribe((e) => {
      // Re-sort by timestamp on every arrival. This is what keeps late-
      // arriving events (specifically: the historical radar mints seeded
      // by the radar-source poller's first fetch) inserted at their
      // correct chronological position rather than at the top of the
      // rail. Live mints + mock spawns still naturally rise to the top
      // because their `at` is the newest at arrival time.
      setEvents((prev) => {
        const next = [e, ...prev];
        next.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
        return next.slice(0, 50);
      });
    });
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      unsub();
      clearInterval(tick);
    };
  }, []);

  // Identity resolution — on-chain (radar) mints carry their identity
  // inline on the event; off-chain (join) events resolve via population
  // store. Both produce the same polished display treatment.
  const resolve = (event: ActivityEvent): PuruhaniIdentity | null => {
    if (event.kind === "mint") return event.identity;
    const entry = populationStore.current().find((p) => p.trader === event.actor);
    return entry?.identity ?? null;
  };

  // Empty-state value is a single em-dash so the right-hand indicator
  // keeps a stable width.
  const lastSeen = events.length > 0 ? timeAgo(events[0].at, now) : "—";

  return (
    <aside className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden border-l border-puru-surface-border bg-puru-cloud-bright shadow-puru-rim-left">
      <header className="relative z-10 shrink-0 bg-puru-cloud-bright px-6 py-4 shadow-[0_1px_0_0_var(--puru-surface-border),0_2px_4px_var(--puru-surface-shadow-sm)]">
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
      {events.length === 0 ? (
        <div className="flex flex-1 items-center justify-center bg-puru-cloud-base px-5 py-12">
          <p className="font-puru-body text-xs uppercase tracking-[0.18em] text-puru-ink-dim">
            awaiting first event
          </p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-puru-surface-border overflow-y-auto overflow-x-hidden bg-puru-cloud-base">
          {events.map((e) => {
            const rowStyle = {
              color: `var(--puru-${e.element}-vivid)`,
            };
            const actor = resolve(e);
            const isYou = connectedWallet !== null && e.actor === connectedWallet;
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
                    size={ICON_SIZE}
                  />
                ) : (
                  <span
                    className="flex shrink-0 items-center justify-center rounded-full font-puru-card text-lg text-puru-cloud-bright"
                    style={{
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                      backgroundColor: `var(--puru-${e.element}-vivid)`,
                    }}
                  >
                    ✦
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-puru-body text-sm leading-tight text-puru-ink-base">
                    <span className="font-puru-display text-xs text-puru-ink-rich">
                      {actor?.displayName ?? e.actor.slice(0, 6)}
                    </span>
                    {isYou ? (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-puru-ink-rich px-1.5 py-0.5 font-puru-mono text-[9px] font-bold leading-none tracking-[0.12em] text-puru-cloud-bright">
                        YOU
                      </span>
                    ) : e.origin === "on-chain" ? null : (
                      <span className="ml-1 font-puru-body text-2xs text-puru-ink-dim">
                        @{actor?.username ?? e.actor.slice(0, 6).toLowerCase()}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate font-puru-body text-xs leading-tight text-puru-ink-soft">
                    Claimed {indefiniteArticle(e.element)} {titleCase(e.element)} Stone
                  </p>
                </div>
                <span className="inline-block min-w-[4.5em] shrink-0 self-start text-right font-puru-body text-2xs uppercase tracking-[0.18em] tabular-nums text-puru-ink-dim">
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
