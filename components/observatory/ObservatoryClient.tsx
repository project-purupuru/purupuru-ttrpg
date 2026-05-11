"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { weatherFeed } from "@/lib/weather";
import type { WeatherState } from "@/lib/weather";
import type { Element } from "@/lib/score";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import { activityStream, seedActivityEvent } from "@/lib/activity";
import { ELEMENTS as ALL_ELEMENTS } from "@/lib/score";
import { populationStore } from "@/lib/sim/population";
import { getSonifier } from "@/lib/audio/sonify";
import Image from "next/image";
import { KpiStrip } from "./KpiStrip";
import { ActivityRail } from "./ActivityRail";
import { WeatherTile } from "./WeatherTile";
import { IntroAnimation } from "./IntroAnimation";
import { PentagramCanvas } from "./PentagramCanvas";
import { FocusCard } from "./FocusCard";
import { MusicPlayer } from "./MusicPlayer";
import { MobileBottomPanel } from "./MobileBottomPanel";

const ZERO_DISTRIBUTION: Record<Element, number> = {
  wood: 0, fire: 0, earth: 0, water: 0, metal: 0,
};

const ELEMENT_DISPLAY_ORDER: readonly Element[] = ["wood", "fire", "earth", "metal", "water"] as const;

export function ObservatoryClient() {
  const [introDone, setIntroDone] = useState(false);
  const [distribution, setDistribution] = useState<Record<Element, number>>(ZERO_DISTRIBUTION);
  const [weather, setWeather] = useState<WeatherState>(weatherFeed.current());
  const [focused, setFocused] = useState<PuruhaniIdentity | null>(null);
  // `playing` drives the MusicPlayer's <audio> element. `sfxEnabled`
  // independently toggles the pentatonic sonifier — both must be true
  // for the per-event chimes to fire, so the user can run the
  // soundtrack alone, the chimes alone (rare, but possible after a
  // first play), or both. The sonifier's AudioContext is independent
  // of the MP3 audio routing, so the two streams don't fight for the
  // same resource.
  const [playing, setPlaying] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const focusCardRef = useRef<HTMLElement>(null);
  // Timestamp of the most-recent sprite-click. Used by the
  // outside-click-closes-focus listener to ignore the same click that
  // *opened* the card via Pixi's pointertap (Pixi's federated event and
  // the underlying DOM click both fire on the same gesture).
  const lastSpriteClickRef = useRef(0);

  const handleSpriteClick = useCallback((id: PuruhaniIdentity) => {
    lastSpriteClickRef.current = Date.now();
    setFocused(id);
  }, []);

  // Stable identities for the music player's prop callbacks. The
  // sonifier lifecycle is owned by the effect below — these handlers
  // just flip React state.
  const handlePlayingChange = useCallback((next: boolean) => {
    setPlaying(next);
  }, []);
  const handleSfxToggle = useCallback(() => {
    setSfxEnabled((prev) => !prev);
  }, []);

  // Auto theme — flip <html data-theme> on the user's local sunrise/sunset.
  // "old-horai" is the existing dark token block; "day-horai" is a sentinel
  // value that defeats the prefers-color-scheme:dark mirror (which only
  // applies to :root:not([data-theme])) so system-dark users still get
  // light during their local daytime. is_night stays undefined until the
  // live feed lands its first fetch — we leave the attribute alone in that
  // window so initial paint follows system preference.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (weather.is_night === undefined) return;
    document.documentElement.dataset.theme = weather.is_night ? "old-horai" : "day-horai";
  }, [weather.is_night]);

  // Post-mint loop closure · when the user arrives via mint route's
  // links.next bridge (?welcome=<element>), seed one curated JoinActivity
  // 5s after mount so the visitor's just-arrived stone visibly joins the
  // rail. Demo-bridge for proof #4 ("I am not alone") · stand-in until
  // zerker's radar indexer wires real StoneClaimed events into the stream.
  // Fires once per visit · guarded by introDone to land after the intro.
  useEffect(() => {
    if (!introDone || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const welcome = params.get("welcome")?.toLowerCase();
    if (!welcome || !ALL_ELEMENTS.includes(welcome as Element)) return;
    const timer = window.setTimeout(() => {
      seedActivityEvent({
        id: `welcome-${Date.now()}`,
        kind: "join",
        origin: "off-chain",
        element: welcome as Element,
        actor: "you" as never,
        at: new Date().toISOString(),
      });
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [introDone]);

  // Sonifier lifecycle — runs only while BOTH music is playing AND sfx
  // is enabled. Cleanup unsubscribes and suspends the AudioContext, so
  // toggling either flag off silences the chimes without affecting the
  // <audio> element. The first sonifier.start() call rides the user
  // gesture from a button click (effect runs synchronously after the
  // click-driven render); subsequent resumes don't need a fresh gesture
  // per AudioContext spec.
  useEffect(() => {
    if (!playing || !sfxEnabled) return;
    const sonifier = getSonifier();
    void sonifier.start();
    const unsub = activityStream.subscribe((e) => {
      sonifier.play({ element: e.element, kind: e.kind });
    });
    return () => {
      unsub();
      sonifier.stop();
    };
  }, [playing, sfxEnabled]);

  // Outside-click-closes — listener attaches only while a sprite is
  // focused, so the click that *opened* the card never reaches this
  // handler (effect runs after the open render). The 80ms guard catches
  // the rare case of clicking a different sprite while one is focused —
  // setFocused replaces the identity; without the guard the document
  // listener would also fire and clobber it back to null.
  useEffect(() => {
    if (!focused) return;
    const onDocClick = (e: MouseEvent) => {
      if (Date.now() - lastSpriteClickRef.current < 80) return;
      const card = focusCardRef.current;
      if (card && card.contains(e.target as Node)) return;
      setFocused(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [focused]);

  // KPI sources — strip counts come straight from the populationStore so
  // the numbers always equal the actual on-map sprite count per element.
  // Subscribing fires on every spawn (initial seed = no fires; YOU spawn
  // + each trickle = one fire) — cheap recompute, no polling needed.
  // Weather drives the canvas + theme.
  useEffect(() => {
    setDistribution(populationStore.distribution());
    const unsubPop = populationStore.subscribe(() => {
      setDistribution(populationStore.distribution());
    });
    const unsubWeather = weatherFeed.subscribe(setWeather);
    return () => {
      unsubPop();
      unsubWeather();
    };
  }, []);

  // Leading clan — same computation as KpiStrip; powers the canvas-pane
  // edge gradient so the ambient backdrop tint follows whichever clan
  // is currently winning.
  const leader = useMemo(() => {
    let best: Element = "wood";
    let bestVal = -Infinity;
    for (const el of ELEMENT_DISPLAY_ORDER) {
      if (distribution[el] > bestVal) {
        bestVal = distribution[el];
        best = el;
      }
    }
    return best;
  }, [distribution]);

  return (
    <div className="flex h-dvh flex-col bg-puru-cloud-deep text-puru-ink-base">
      {!introDone && <IntroAnimation onDone={() => setIntroDone(true)} />}
      {/* Mobile-only compact header — brand wordmark + a tiny live pulse.
          The world stats live in the Stats tab below. Desktop's full
          KpiStrip takes over above lg via its own breakpoint. */}
      <div className="flex shrink-0 items-center justify-between border-b border-puru-surface-border bg-puru-cloud-bright px-4 py-2.5 lg:hidden">
        <span className="puru-wordmark-drift inline-flex">
          <Image
            src="/brand/purupuru-wordmark.svg"
            alt="purupuru"
            width={76}
            height={24}
            priority
            className="dark:hidden"
          />
          <Image
            src="/brand/purupuru-wordmark-white.svg"
            alt="purupuru"
            width={76}
            height={24}
            priority
            className="hidden dark:block"
          />
        </span>
        <span className="inline-flex items-center gap-2 font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim">
          <span
            className="puru-live-dot inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "var(--puru-wood-vivid)" }}
            aria-hidden
          />
          <span>live</span>
        </span>
      </div>
      <div className="hidden lg:block">
        <KpiStrip distribution={distribution} />
      </div>
      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_440px]">
        <div className="relative min-h-0">
          <PentagramCanvas
            onSpriteClick={handleSpriteClick}
            focusedTrader={focused?.trader ?? null}
            amplifiedElement={weather.amplifiedElement}
          />
          {/* Leading-clan edge gradient — soft cloud-like vignette
              tinted by whichever element is currently winning. Updates
              every 3s when the score adapter refreshes; the 1.2s
              transition smooths the cross-fade so a leader change
              reads as the cosmos shifting weather, not a snap. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 transition-[background] duration-[1200ms] ease-out"
            style={{
              background: `radial-gradient(ellipse at center, transparent 35%, color-mix(in oklch, var(--puru-${leader}-vivid) 18%, transparent) 100%)`,
            }}
          />
          {/* Synthetic-data disclaimer — top-right corner of the canvas
              pane. Honest signal to judges that this is a v0 demo with
              mocked stream + score data; the design vocab matches the
              other "live"/timestamp eyebrows so it reads as a UI label
              rather than a watermark. */}
          <span className="pointer-events-none absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-puru-sm border border-puru-surface-border bg-puru-cloud-bright/85 px-2.5 py-1 font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim shadow-puru-tile backdrop-blur-sm">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-puru-ink-dim/60"
            />
            synthetic data · demo
          </span>
          {/* MusicPlayer + FocusCard share the canvas pane's stacking
              context so the focus card cleanly slides in over the
              player when a sprite is clicked. Both anchored to bottom-
              left at the same width (340px) so they line up exactly. */}
          <MusicPlayer
            playing={playing}
            onPlayingChange={handlePlayingChange}
            sfxEnabled={sfxEnabled}
            onSfxToggle={handleSfxToggle}
            isNight={weather.is_night}
          />
          <FocusCard
            identity={focused}
            onClose={() => setFocused(null)}
            wrapperRef={focusCardRef}
          />
        </div>
        <aside className="hidden min-h-0 grid-rows-[minmax(0,1fr)_minmax(280px,auto)] overflow-hidden lg:grid">
          <div className="min-h-0 overflow-hidden">
            <ActivityRail />
          </div>
          <div className="min-h-0 overflow-hidden">
            <WeatherTile state={weather} />
          </div>
        </aside>
      </main>
      <MobileBottomPanel
        distribution={distribution}
        weather={weather}
      />
    </div>
  );
}
