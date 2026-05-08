"use client";

import { useEffect, useState } from "react";
import { activityStream, type ActivityEvent } from "@/lib/activity";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

function timeAgo(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  if (diff < 5 * SECOND) return "just now";
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
  return `${Math.floor(diff / MINUTE)}m ago`;
}

function shortAddr(addr: string): string {
  if (!addr || addr.length < 8) return addr;
  return `…${addr.slice(-4)}`;
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

export function ActivityRail() {
  const [events, setEvents] = useState<ActivityEvent[]>(() => activityStream.recent());
  const [now, setNow] = useState<number>(() => Date.now());

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

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l border-puru-surface-border bg-puru-cloud-bright shadow-puru-tile">
      <header className="shrink-0 border-b border-puru-surface-border bg-puru-cloud-bright px-6 py-5">
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
          {events.map((e) => (
            <li key={e.id} className="puru-row flex items-center gap-3 px-5 py-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-puru-card text-base text-puru-cloud-bright"
                style={{ backgroundColor: `var(--puru-${e.element}-vivid)` }}
                aria-label={e.element}
              >
                {KIND_GLYPH[e.kind]}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate font-puru-mono text-xs">
                  <span className="font-puru-display text-sm text-puru-ink-rich">
                    {shortAddr(e.actor)}
                  </span>
                  <span className="text-puru-ink-soft"> {KIND_LABEL[e.kind]}</span>
                  {e.target ? (
                    <>
                      <span className="text-puru-ink-soft"> → </span>
                      <span className="font-puru-display text-sm text-puru-ink-base">
                        {shortAddr(e.target)}
                      </span>
                    </>
                  ) : null}
                </p>
                <span className="font-puru-mono text-2xs uppercase tracking-[0.18em] text-puru-ink-dim">
                  {timeAgo(e.at, now)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
