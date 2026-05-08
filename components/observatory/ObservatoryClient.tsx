"use client";

import { useEffect, useState } from "react";
import { scoreAdapter } from "@/lib/score";
import { weatherFeed } from "@/lib/weather";
import type { WeatherState } from "@/lib/weather";
import { ELEMENTS, type Element } from "@/lib/score";
import { TopBar } from "./TopBar";
import { KpiStrip } from "./KpiStrip";
import { ActivityRail } from "./ActivityRail";
import { WeatherTile } from "./WeatherTile";
import { IntroAnimation } from "./IntroAnimation";
import { PentagramCanvas, OBSERVATORY_SPRITE_COUNT } from "./PentagramCanvas";

const ZERO_DISTRIBUTION: Record<Element, number> = {
  wood: 0, fire: 0, earth: 0, water: 0, metal: 0,
};

export function ObservatoryClient() {
  const [introDone, setIntroDone] = useState(false);
  const [distribution, setDistribution] = useState<Record<Element, number>>(ZERO_DISTRIBUTION);
  const [cosmicIntensity, setCosmicIntensity] = useState(0);
  const [cycleBalance, setCycleBalance] = useState(0.5);
  const [weather, setWeather] = useState<WeatherState>(weatherFeed.current());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dist, energy] = await Promise.all([
        scoreAdapter.getElementDistribution(),
        scoreAdapter.getEcosystemEnergy(),
      ]);
      if (cancelled) return;
      setDistribution(dist);
      setCosmicIntensity(energy.cosmic_intensity ?? 0);
      setCycleBalance(energy.cycle_balance ?? 0.5);
    })();
    const unsub = weatherFeed.subscribe(setWeather);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const distributionTotal = ELEMENTS.reduce((sum, el) => sum + distribution[el], 0);
  const activeCount = distributionTotal > 0 ? OBSERVATORY_SPRITE_COUNT : 0;

  return (
    <div className="flex h-dvh flex-col bg-puru-cloud-base text-puru-ink-base">
      {!introDone && <IntroAnimation onDone={() => setIntroDone(true)} />}
      <TopBar activeCount={activeCount} />
      <KpiStrip
        distribution={distribution}
        cosmicIntensity={cosmicIntensity}
        cycleBalance={cycleBalance}
      />
      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_380px]">
        <div className="relative min-h-0">
          <PentagramCanvas />
        </div>
        <aside className="grid grid-rows-[1fr_auto]">
          <ActivityRail />
          <WeatherTile state={weather} />
        </aside>
      </main>
    </div>
  );
}
