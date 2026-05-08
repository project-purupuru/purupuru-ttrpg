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
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
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
      setEvents((prev) => [e, ...prev].slice(0, 20));
    });
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      unsub();
      clearInterval(tick);
    };
  }, []);

  return (
    <aside className="flex min-h-0 flex-col border-l border-puru-cloud-dim bg-puru-cloud-bright">
      <header className="border-b border-puru-cloud-dim px-5 py-4">
        <h3 className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
          recent activity
        </h3>
        <p className="mt-1 font-puru-display text-base text-puru-ink-rich">
          live across the cycle
        </p>
      </header>
      {events.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <p className="font-puru-mono text-xs uppercase tracking-[0.18em] text-puru-ink-dim">
            awaiting first event
          </p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-puru-cloud-dim overflow-y-auto">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-5 py-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-puru-card text-base text-puru-cloud-bright"
                style={{ backgroundColor: `var(--puru-${e.element}-vivid)` }}
                aria-label={e.element}
              >
                {KIND_GLYPH[e.kind]}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate font-puru-mono text-sm text-puru-ink-rich">
                  <span className="font-puru-display">{shortAddr(e.actor)}</span>
                  <span className="text-puru-ink-soft"> {KIND_LABEL[e.kind]}</span>
                  {e.target ? (
                    <>
                      <span className="text-puru-ink-soft"> → </span>
                      <span className="font-puru-display">{shortAddr(e.target)}</span>
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
