"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ELEMENTS, scoreAdapter, type Element } from "@/lib/score";
import type { WalletProfile, WalletSignals } from "@/lib/score";
import { activityStream, type ActivityEvent } from "@/lib/activity";
import type { ElementShiftActivity, MintActivity } from "@/lib/activity/types";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import { PuruhaniAvatar } from "./PuruhaniAvatar";

/**
 * Focus card — slide-in panel summarising a clicked puruhani.
 *
 * Anchored bottom-right of the canvas so the pentagram center stays
 * visible. Severe metaphysical-monochrome register (per dig 2026-05-08
 * §5 Co-Star + Stellarium): big mono numerics, tiny uppercase tracking
 * labels, ceramic-tile bg with backdrop blur. The card stays mounted
 * after first open so its slide-out can preserve the identity content
 * while transitioning; a sticky-identity ref keeps the DOM populated.
 *
 * Dismiss vectors: explicit close button · ESC · clicking another sprite
 * (replaces identity, doesn't close). No outside-click-to-close —
 * keeps interaction model predictable on a busy canvas.
 */

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木", fire: "火", earth: "土", water: "水", metal: "金",
};

// Kept in sync with ActivityRail · drift-report alignment 2026-05-09.
// Per-puruhani recent-activity list shows ONLY wallet-bound variants — weather
// + quiz_completed are wallet-agnostic on the canonical schema and never
// reference a specific actor, so they're filtered out at the source.
function recentVerb(e: MintActivity | ElementShiftActivity): string {
  if (e.kind === "mint") return "claimed a stone";
  return `drifted to ${e.element}`;
}

function timeAgo(iso: string, nowMs: number): string {
  const diff = nowMs - new Date(iso).getTime();
  if (diff < 5_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1_000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function FocusCard({
  identity,
  onClose,
  wrapperRef: externalRef,
}: {
  identity: PuruhaniIdentity | null;
  onClose: () => void;
  /** Optional ref forwarded to the outer aside — used by parent to
   * detect outside-clicks via containment check. */
  wrapperRef?: RefObject<HTMLElement | null>;
}) {
  const localRef = useRef<HTMLElement>(null);
  const wrapperRef = externalRef ?? localRef;
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [signals, setSignals] = useState<WalletSignals | null>(null);
  const [recent, setRecent] = useState<Array<MintActivity | ElementShiftActivity>>([]);
  const [now, setNow] = useState<number>(0);
  const [stickyIdentity, setStickyIdentity] = useState<PuruhaniIdentity | null>(null);

  // Track now() client-side only to avoid SSR/CSR mismatch on time-ago.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  // Keep last-known identity during exit so the slide-out preserves
  // its content rather than going blank as the panel translates away.
  useEffect(() => {
    if (identity) setStickyIdentity(identity);
  }, [identity]);

  useEffect(() => {
    if (!identity) return;
    let cancelled = false;
    Promise.all([
      scoreAdapter.getWalletProfile(identity.trader),
      scoreAdapter.getWalletSignals(identity.trader),
    ]).then(([p, s]) => {
      if (cancelled) return;
      setProfile(p);
      setSignals(s);
    });
    const filterRecent = () => {
      const all = activityStream.recent(50);
      // Only wallet-bound variants can match this puruhani · weather +
      // quiz_completed are ambient and never reference a specific actor.
      const isWalletBound = (
        e: ActivityEvent,
      ): e is MintActivity | ElementShiftActivity =>
        e.kind === "mint" || e.kind === "element_shift";
      setRecent(
        all
          .filter(isWalletBound)
          .filter((e) => e.actor === identity.trader)
          .slice(0, 5),
      );
    };
    filterRecent();
    const unsub = activityStream.subscribe(filterRecent);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [identity]);

  // ESC closes
  useEffect(() => {
    if (!identity) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [identity, onClose]);

  const isOpen = identity !== null;
  const id = identity ?? stickyIdentity;
  if (!id) return null;

  const primary = profile?.primaryElement ?? "wood";

  return (
    <aside
      ref={wrapperRef}
      role="dialog"
      aria-label="puruhani details"
      aria-hidden={!isOpen}
      className="absolute left-4 bottom-4 z-20 w-[340px] md:bottom-[82px]"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(-110%)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "transform 360ms cubic-bezier(.32,.72,.24,1), opacity 240ms ease-out",
      }}
    >
      <div className="overflow-hidden rounded-puru-md border border-puru-surface-border bg-puru-cloud-bright/95 shadow-puru-tile backdrop-blur-md">
        <header
          className="flex items-start gap-3 border-b border-puru-surface-border px-4 py-3"
          style={{
            backgroundImage: `linear-gradient(to left, color-mix(in oklch, var(--puru-${primary}-vivid) 14%, transparent) 0%, transparent 60%)`,
          }}
        >
          <PuruhaniAvatar seed={id.pfp} primary={primary} size={56} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-puru-display text-lg leading-tight text-puru-ink-rich">
              {id.displayName}
            </h3>
            <p className="truncate font-puru-mono text-xs text-puru-ink-soft">@{id.username}</p>
            <p className="mt-0.5 truncate font-puru-mono text-2xs text-puru-ink-dim">
              {shortAddress(id.trader)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="shrink-0 rounded-puru-sm p-1 font-puru-mono text-sm text-puru-ink-dim transition-colors hover:bg-puru-cloud-base hover:text-puru-ink-rich"
          >
            ✕
          </button>
        </header>

        <div className="grid grid-cols-2 gap-2 px-4 py-3">
          <div className="flex flex-col gap-1">
            <span className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">primary</span>
            <span className="flex items-baseline gap-2">
              <span
                aria-hidden
                className="font-puru-card text-2xl leading-none"
                style={{ color: `var(--puru-${primary}-vivid)` }}
              >
                {ELEMENT_KANJI[primary]}
              </span>
              <span className="font-puru-mono text-sm capitalize text-puru-ink-rich">
                {primary}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">archetype</span>
            <span className="font-puru-mono text-sm capitalize text-puru-ink-rich">
              {id.archetype}
            </span>
          </div>
        </div>

        {profile ? (
          <div className="border-t border-puru-cloud-dim/60 px-4 py-3">
            <h4 className="mb-2 font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
              element affinity
            </h4>
            <AffinityRadar affinity={profile.elementAffinity} primary={primary} />
          </div>
        ) : null}

        <div className="border-t border-puru-cloud-dim/60 px-4 py-3">
          <h4 className="mb-2 font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
            recent activity
          </h4>
          {recent.length === 0 ? (
            <p className="font-puru-mono text-xs text-puru-ink-dim">no recent activity</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {recent.map((e) => (
                <li key={e.id} className="flex items-center gap-2 font-puru-mono text-xs">
                  <span
                    className="truncate text-puru-ink-base"
                    style={{ color: `var(--puru-${e.element}-vivid)` }}
                  >
                    {recentVerb(e)}
                  </span>
                  <span className="ml-auto whitespace-nowrap font-puru-mono text-2xs uppercase tracking-[0.18em] text-puru-ink-dim">
                    {now ? timeAgo(e.at, now) : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {signals ? (
          <div className="grid grid-cols-3 gap-2 border-t border-puru-cloud-dim/60 bg-puru-cloud-base/40 px-4 py-3">
            {(["velocity", "diversity", "resonance"] as const).map((k) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">{k}</span>
                <span className="font-puru-mono text-sm tabular-nums text-puru-ink-rich">
                  {Math.round(signals[k] * 100)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

const RADAR_ORDER: Element[] = ["wood", "fire", "earth", "metal", "water"];

function AffinityRadar({
  affinity,
  primary,
}: {
  affinity: Record<Element, number>;
  primary: Element;
}) {
  const SIZE = 132;
  const CENTER = SIZE / 2;
  const RADIUS = 46;
  const max = Math.max(...ELEMENTS.map((el) => affinity[el]), 1);

  function vertexAt(i: number, r: number) {
    // -90deg = top vertex (wood)
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
  }

  const outerPoints = RADAR_ORDER.map((_, i) => {
    const v = vertexAt(i, RADIUS);
    return `${v.x.toFixed(1)},${v.y.toFixed(1)}`;
  }).join(" ");

  const halfPoints = RADAR_ORDER.map((_, i) => {
    const v = vertexAt(i, RADIUS / 2);
    return `${v.x.toFixed(1)},${v.y.toFixed(1)}`;
  }).join(" ");

  const affinityPoints = RADAR_ORDER.map((el, i) => {
    const r = (affinity[el] / max) * RADIUS;
    const v = vertexAt(i, r);
    return `${v.x.toFixed(1)},${v.y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="flex items-center gap-3">
      <svg width={SIZE} height={SIZE} className="shrink-0" aria-hidden>
        <polygon
          points={outerPoints}
          fill="none"
          stroke="var(--puru-ink-ghost)"
          strokeWidth={1}
        />
        <polygon
          points={halfPoints}
          fill="none"
          stroke="var(--puru-ink-ghost)"
          strokeWidth={0.5}
          strokeDasharray="2 2"
        />
        <polygon
          points={affinityPoints}
          fill={`var(--puru-${primary}-vivid)`}
          fillOpacity={0.28}
          stroke={`var(--puru-${primary}-vivid)`}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {RADAR_ORDER.map((el, i) => {
          const v = vertexAt(i, RADIUS + 11);
          return (
            <text
              key={el}
              x={v.x}
              y={v.y + 3.5}
              textAnchor="middle"
              fontFamily="ZCOOL KuaiLe, FOT-Yuruka Std, serif"
              fontSize={11}
              fill={`var(--puru-${el}-vivid)`}
            >
              {ELEMENT_KANJI[el]}
            </text>
          );
        })}
      </svg>
      <ul className="flex min-w-0 flex-1 flex-col gap-1">
        {RADAR_ORDER.map((el) => (
          <li key={el} className="flex items-baseline gap-2 font-puru-mono text-2xs">
            <span
              aria-hidden
              className="font-puru-card text-sm leading-none"
              style={{ color: `var(--puru-${el}-vivid)` }}
            >
              {ELEMENT_KANJI[el]}
            </span>
            <span className="uppercase tracking-[0.18em] text-puru-ink-soft">{el}</span>
            <span className="ml-auto tabular-nums text-puru-ink-rich">{affinity[el]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
