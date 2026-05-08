"use client";

import { useEffect, useState } from "react";
import { scoreAdapter } from "@/lib/score";
import { weatherFeed } from "@/lib/weather";
import type { WeatherState } from "@/lib/weather";
import type { Element } from "@/lib/score";
import { TopBar } from "./TopBar";
import { KpiStrip } from "./KpiStrip";
import { ActivityRail } from "./ActivityRail";
import { WeatherTile } from "./WeatherTile";
import { IntroAnimation } from "./IntroAnimation";
import { PentagramCanvas } from "./PentagramCanvas";

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

  return (
    <div className="flex h-dvh flex-col bg-puru-cloud-deep text-puru-ink-base">
      {!introDone && <IntroAnimation onDone={() => setIntroDone(true)} />}
      <TopBar />
      <KpiStrip
        distribution={distribution}
        cosmicIntensity={cosmicIntensity}
        cycleBalance={cycleBalance}
      />
      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_380px]">
        <div className="relative min-h-0">
          <PentagramCanvas />
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
