"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scoreAdapter } from "@/lib/score";
import { weatherFeed } from "@/lib/weather";
import type { WeatherState } from "@/lib/weather";
import type { Element } from "@/lib/score";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import { activityStream, type ActivityEvent } from "@/lib/activity";
import { OBSERVATORY_SPRITE_COUNT } from "@/lib/sim/entities";
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

// Rolling window for the cycle-balance derivation. 30 events spans
// roughly the last 60–90s at the activity stream's emit cadence —
// long enough to read as a "current mood," short enough to actually
// shift when a streak of one kind hits.
const CYCLE_BALANCE_WINDOW = 30;

export function ObservatoryClient() {
  const [introDone, setIntroDone] = useState(false);
  const [distribution, setDistribution] = useState<Record<Element, number>>(ZERO_DISTRIBUTION);
  const [weather, setWeather] = useState<WeatherState>(weatherFeed.current());
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>(() =>
    activityStream.recent(CYCLE_BALANCE_WINDOW),
  );
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

  // KPI sources — every metric derives from an observable signal that
  // correlates with the canvas:
  //   live presence    → OBSERVATORY_SPRITE_COUNT (matches what the canvas renders)
  //   wuxing dist      → scoreAdapter.getElementDistribution() (same source the canvas seeds from)
  //   cycle balance    → derived from recentActivity below (mints+gifts vs attacks)
  //   cosmic intensity → weather.cosmic_intensity (same source the canvas tide+halo read)
  useEffect(() => {
    let cancelled = false;
    const refetch = async () => {
      const dist = await scoreAdapter.getElementDistribution();
      if (cancelled) return;
      setDistribution(dist);
    };
    refetch();
    const id = setInterval(refetch, 3000);
    const unsubWeather = weatherFeed.subscribe(setWeather);
    const unsubActivity = activityStream.subscribe((e) => {
      setRecentActivity((prev) => [e, ...prev].slice(0, CYCLE_BALANCE_WINDOW));
    });
    return () => {
      cancelled = true;
      clearInterval(id);
      unsubWeather();
      unsubActivity();
    };
  }, []);

  // Sheng (生 generation) vs Ke (克 destruction). Mints + gifts are
  // constructive; attacks are destructive. Ratio drifts as the activity
  // window rolls — high values read as "the world is building," low as
  // "the world is contentious." Defaults to 0.5 (neutral) before any
  // events have arrived.
  const cycleBalance = useMemo(() => {
    if (recentActivity.length === 0) return 0.5;
    let constructive = 0;
    for (const e of recentActivity) {
      if (e.kind === "mint" || e.kind === "gift") constructive++;
    }
    return constructive / recentActivity.length;
  }, [recentActivity]);

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
        <KpiStrip
          totalActive={OBSERVATORY_SPRITE_COUNT}
          distribution={distribution}
          cosmicIntensity={weather.cosmic_intensity}
          cycleBalance={cycleBalance}
        />
      </div>
      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_440px]">
        <div className="relative min-h-0">
          <PentagramCanvas
            onSpriteClick={handleSpriteClick}
            focusedTrader={focused?.trader ?? null}
          />
          {/* MusicPlayer + FocusCard share the canvas pane's stacking
              context so the focus card cleanly slides in over the
              player when a sprite is clicked. Both anchored to bottom-
              left at the same width (340px) so they line up exactly. */}
          <MusicPlayer
            playing={playing}
            onPlayingChange={handlePlayingChange}
            sfxEnabled={sfxEnabled}
            onSfxToggle={handleSfxToggle}
          />
          <FocusCard
            identity={focused}
            onClose={() => setFocused(null)}
            wrapperRef={focusCardRef}
          />
        </div>
        <aside className="hidden min-h-0 grid-rows-[1fr_auto] overflow-hidden lg:grid">
          <div className="min-h-0 overflow-hidden">
            <ActivityRail />
          </div>
          <div className="shrink-0">
            <WeatherTile state={weather} />
          </div>
        </aside>
      </main>
      <MobileBottomPanel
        totalActive={OBSERVATORY_SPRITE_COUNT}
        distribution={distribution}
        cosmicIntensity={weather.cosmic_intensity}
        cycleBalance={cycleBalance}
        weather={weather}
      />
    </div>
  );
}
