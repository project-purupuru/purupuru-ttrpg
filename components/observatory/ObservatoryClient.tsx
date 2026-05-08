"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scoreAdapter } from "@/lib/score";
import { weatherFeed } from "@/lib/weather";
import type { WeatherState } from "@/lib/weather";
import type { Element } from "@/lib/score";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import { TopBar } from "./TopBar";
import { KpiStrip } from "./KpiStrip";
import { ActivityRail } from "./ActivityRail";
import { WeatherTile } from "./WeatherTile";
import { IntroAnimation } from "./IntroAnimation";
import { PentagramCanvas } from "./PentagramCanvas";
import { FocusCard } from "./FocusCard";

const ZERO_DISTRIBUTION: Record<Element, number> = {
  wood: 0, fire: 0, earth: 0, water: 0, metal: 0,
};

export function ObservatoryClient() {
  const [introDone, setIntroDone] = useState(false);
  const [distribution, setDistribution] = useState<Record<Element, number>>(ZERO_DISTRIBUTION);
  const [cosmicIntensity, setCosmicIntensity] = useState(0);
  const [cycleBalance, setCycleBalance] = useState(0.5);
  const [totalActive, setTotalActive] = useState(0);
  const [weather, setWeather] = useState<WeatherState>(weatherFeed.current());
  const [focused, setFocused] = useState<PuruhaniIdentity | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    const refetch = async () => {
      const [dist, energy] = await Promise.all([
        scoreAdapter.getElementDistribution(),
        scoreAdapter.getEcosystemEnergy(),
      ]);
      if (cancelled) return;
      setDistribution(dist);
      setCosmicIntensity(energy.cosmic_intensity ?? 0);
      setCycleBalance(energy.cycle_balance ?? 0.5);
      setTotalActive(Math.round(energy.total_active ?? 0));
    };
    refetch();
    // Re-poll on a 3s cadence so the KPI strip drifts visibly. Mock
    // values are sine-modulated by Date.now(); a real adapter would
    // emit live updates here.
    const id = setInterval(refetch, 3000);
    const unsub = weatherFeed.subscribe(setWeather);
    return () => {
      cancelled = true;
      clearInterval(id);
      unsub();
    };
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-puru-cloud-deep text-puru-ink-base">
      {!introDone && <IntroAnimation onDone={() => setIntroDone(true)} />}
      <TopBar />
      <KpiStrip
        totalActive={totalActive}
        distribution={distribution}
        cosmicIntensity={cosmicIntensity}
        cycleBalance={cycleBalance}
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
