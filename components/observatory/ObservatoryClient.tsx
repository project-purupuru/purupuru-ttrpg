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
import { KpiStrip } from "./KpiStrip";
import { ActivityRail } from "./ActivityRail";
import { WeatherTile } from "./WeatherTile";
import { IntroAnimation } from "./IntroAnimation";
import { PentagramCanvas } from "./PentagramCanvas";
import { FocusCard } from "./FocusCard";

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
  const [soundEnabled, setSoundEnabled] = useState(false);
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

  // Sound toggle — must be invoked from a click handler, since the
  // browser autoplay policy requires a user gesture to resume the
  // AudioContext on first activation. Subsequent toggles just suspend
  // and resume the existing context (instant).
  const handleToggleSound = useCallback(async () => {
    const sonifier = getSonifier();
    if (soundEnabled) {
      sonifier.stop();
      setSoundEnabled(false);
    } else {
      await sonifier.start();
      setSoundEnabled(true);
    }
  }, [soundEnabled]);

  // Sonification subscription — separate from the recentActivity
  // subscription so the audio engine doesn't run unless explicitly
  // enabled. Each event maps to a soft pentatonic note (per dig
  // 2026-05-08 §2 Listen to Wikipedia + dig discussion of game-audio
  // patterns); cooldown + polyphony cap inside the sonifier prevent
  // stacking even at burst cadence.
  useEffect(() => {
    if (!soundEnabled) return;
    const sonifier = getSonifier();
    const unsub = activityStream.subscribe((e) => {
      sonifier.play({ element: e.element, kind: e.kind });
    });
    return unsub;
  }, [soundEnabled]);

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

  // KPI sources after the accuracy-validation pass:
  //   live presence    → OBSERVATORY_SPRITE_COUNT (matches what the canvas renders)
  //   wuxing dist      → scoreAdapter.getElementDistribution() (same source the canvas seeds from)
  //   cycle balance    → derived from recentActivity below (mints+gifts vs attacks)
  //   cosmic intensity → weather.cosmic_intensity (same source the canvas tide+halo read)
  //
  // getEcosystemEnergy() is intentionally NOT used here — its
  // total_active / cycle_balance / cosmic_intensity fields are
  // sine-drift mock values not grounded in any observable signal.
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
      <KpiStrip
        totalActive={OBSERVATORY_SPRITE_COUNT}
        distribution={distribution}
        cosmicIntensity={weather.cosmic_intensity}
        cycleBalance={cycleBalance}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />
      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_440px]">
        <div className="relative min-h-0">
          <PentagramCanvas
            onSpriteClick={handleSpriteClick}
            focusedTrader={focused?.trader ?? null}
          />
          <FocusCard
            identity={focused}
            onClose={() => setFocused(null)}
            wrapperRef={focusCardRef}
          />
        </div>
        <aside className="grid min-h-0 grid-rows-[1fr_auto] overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <ActivityRail />
          </div>
          <div className="shrink-0">
            <WeatherTile state={weather} />
          </div>
        </aside>
      </main>
    </div>
  );
}
