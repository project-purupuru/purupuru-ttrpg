import { ELEMENTS, type Element } from "@/lib/score";
import type { Precipitation, WeatherFeed, WeatherState } from "./types";

/**
 * Weather mock — emits subtle drift every 18-25s so the tile feels
 * actively tracked rather than static. State changes are intentionally
 * rare (the awareness layer reads weather as ambient backdrop, not
 * foreground signal); the live indicator carries the "tracking" feel.
 */

const PRECIP: Precipitation[] = ["clear", "rain", "snow", "storm"];

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// Source/location labels — these read as real in the UI today; when
// the world-purupuru weather pipeline (IRL temperature/precipitation
// → wuxing affinity) wires in, these values come from that adapter
// directly, so the on-screen wording stays consistent.
const MOCK_LOCATION = "Tokyo";
const MOCK_SOURCE = "@puruhpuruweather";

function makeInitial(): WeatherState {
  // Seed observed_at a few seconds in the past so the very first render
  // doesn't read as "synced 0s ago" — feels like data already mid-flow.
  const observed = new Date(Date.now() - 6_000).toISOString();
  return {
    temperature_c: 14.2,
    precipitation: "clear",
    cosmic_intensity: 0.62,
    amplifiedElement: "fire",
    amplificationFactor: 1.0,
    observed_at: observed,
    location: MOCK_LOCATION,
    source: MOCK_SOURCE,
  };
}

let state: WeatherState = makeInitial();
const subscribers = new Set<(s: WeatherState) => void>();
let tickHandle: ReturnType<typeof setTimeout> | null = null;

function nextState(prev: WeatherState): WeatherState {
  // Temperature random walk, clamped to a comfortable IRL band.
  const tDelta = (Math.random() - 0.5) * 1.6;
  const temperature_c = Math.round(clamp(prev.temperature_c + tDelta, 8, 22) * 10) / 10;

  // Cosmic intensity: smooth sine over wall-clock so consecutive reads
  // feel like the same underlying signal, not noise.
  const tSec = Date.now() / 1000;
  const cosmic =
    0.5 + 0.25 * Math.sin(tSec / 53) + 0.15 * Math.sin(tSec / 17 + 0.7);
  const cosmic_intensity = Math.round(clamp(cosmic, 0, 1) * 100) / 100;

  // Amplification factor breathes on a slower sine.
  const amp = 0.85 + 0.3 * Math.sin(tSec / 38);
  const amplificationFactor = Math.round(amp * 100) / 100;

  // Precipitation rarely flips; amplified element rarer still.
  const precipitation =
    Math.random() < 0.08
      ? (PRECIP[Math.floor(Math.random() * PRECIP.length)] as Precipitation)
      : prev.precipitation;
  const amplifiedElement =
    Math.random() < 0.05
      ? (ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)] as Element)
      : prev.amplifiedElement;

  return {
    temperature_c,
    precipitation,
    cosmic_intensity,
    amplifiedElement,
    amplificationFactor,
    observed_at: new Date().toISOString(),
    location: prev.location,
    source: prev.source,
  };
}

function emit(s: WeatherState): void {
  state = s;
  for (const cb of subscribers) {
    try {
      cb(s);
    } catch {
      // isolate subscriber errors
    }
  }
}

function scheduleNext(): void {
  if (typeof window === "undefined") return;
  // 18-25s between emits — the IRL bot cadence reads as ambient, not chatty.
  const delay = 18_000 + Math.random() * 7_000;
  tickHandle = setTimeout(() => {
    emit(nextState(state));
    scheduleNext();
  }, delay);
}

function start(): void {
  if (tickHandle !== null) return;
  if (typeof window === "undefined") return;
  scheduleNext();
}

function stop(): void {
  if (tickHandle !== null) {
    clearTimeout(tickHandle);
    tickHandle = null;
  }
}

export const mockWeatherFeed: WeatherFeed = {
  subscribe(cb: (s: WeatherState) => void): () => void {
    subscribers.add(cb);
    if (subscribers.size === 1) start();
    return () => {
      subscribers.delete(cb);
      if (subscribers.size === 0) stop();
    };
  },
  current(): WeatherState {
    return state;
  },
};
