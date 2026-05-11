/**
 * Radar source — polls the radar Solana indexer for `StoneClaimed`
 * events and seeds them into the activityStream. Implements PRD AC-12.9
 * (wire indexer into ActivityRail).
 *
 * Behavior:
 *   - `NEXT_PUBLIC_RADAR_URL` unset → no-op (mock-only mode, identical
 *     to pre-2026-05-10 behavior).
 *   - Set → on first call to `startRadarPolling()`, fetch
 *     `/events/recent` for historical hydration, then poll every
 *     `POLL_INTERVAL_MS` for new events. Dedup by signature.
 *   - Each new event is seeded into the stream via `seedActivityEvent`
 *     so it lands in both `recent()` and `subscribe()` paths.
 *   - Browser-only — guarded against SSR + Node environments.
 *   - Idempotent — repeated calls to `startRadarPolling()` attach
 *     exactly one poller.
 *
 * Failure modes are silent + log-only by design: if radar is down, the
 * existing populationStore-derived mock activity keeps the rail alive
 * (PRD AC-12.9 explicit fallback contract).
 */

import type { Element } from "@/lib/score";
import { identityFor } from "@/lib/sim/identity";
import type { PuruhaniIdentity } from "@/lib/sim/types";
import type { MintActivity } from "./types";

/**
 * Deterministic 31-bit hash of a base58 wallet string → integer seed
 * for `identityFor()`. Same wallet always produces the same seed
 * (and therefore the same displayName/username/avatar) across reloads,
 * sessions, and tabs. Range matches what populationStore feeds
 * `identityFor` (small positive integers).
 */
function seedFromWallet(wallet: string): number {
  let h = 0;
  for (let i = 0; i < wallet.length; i++) {
    h = (h * 31 + wallet.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Standard crypto-UI truncation: 4 leading + 4 trailing chars with an
 * ellipsis between them. Long enough to be recognizable, short enough
 * to fit the activity row's single-line layout.
 *   "61fceHrxioGznJMSr2L1Fj1SBZ9bYkC3Jg6H5wb2UxnV" → "61fc…UxnV"
 */
function shortenAddress(wallet: string): string {
  if (wallet.length <= 9) return wallet;
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}

/**
 * Generate a PuruhaniIdentity for a real on-chain wallet. Uses the
 * same `identityFor` generator populationStore uses for mock spawns
 * (so the avatar/archetype come out polished), but overrides the
 * synthetic `trader` with the real wallet AND replaces the synthetic
 * displayName/username with a shortened-address rendering — real
 * wallets read as real wallets, not as fake personalities. Username
 * uses lowercase so it composes naturally with the rail's `@handle`
 * prefix.
 */
function buildRadarIdentity(wallet: string, element: Element): PuruhaniIdentity {
  const seed = seedFromWallet(wallet);
  const synthetic = identityFor(seed, element);
  const short = shortenAddress(wallet);
  return {
    ...synthetic,
    trader: wallet,
    displayName: short,
    username: short.toLowerCase(),
  };
}

/** Radar's HTTP response shape — must match radar's MintActivity export. */
interface RadarMintActivity {
  signature: string;
  logIndex: number;
  slot: number;
  /** Unix milliseconds — radar pre-multiplies blockTime by 1000. */
  blockTime: number;
  wallet: string;
  element: string;
  weather: string;
  mint: string;
}

interface RadarEventsResponse {
  events: RadarMintActivity[];
}

const POLL_INTERVAL_MS = 5_000;
/** Fetch up to this many on initial hydration; ring buffer max is 200. */
const HISTORY_LIMIT = 50;
/** Each poll only needs the newest few; we dedup anything we've seen. */
const POLL_LIMIT = 20;

const seenSignatures = new Set<string>();
let pollHandle: ReturnType<typeof setInterval> | null = null;
let started = false;

function radarUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_RADAR_URL;
  if (!raw || raw.trim().length === 0) return null;
  return raw.replace(/\/+$/, "");
}

const VALID_ELEMENTS = new Set<Element>(["wood", "fire", "earth", "metal", "water"]);

function isElement(s: string): s is Element {
  return VALID_ELEMENTS.has(s as Element);
}

function toMintActivity(r: RadarMintActivity): MintActivity | null {
  if (!isElement(r.element) || !isElement(r.weather)) {
    console.warn(
      `[radar-source] skipping event with unknown element/weather ` +
        `(${r.element}/${r.weather}) sig=${r.signature}`,
    );
    return null;
  }
  return {
    kind: "mint",
    origin: "on-chain",
    id: `radar:${r.signature}:${r.logIndex}`,
    element: r.element,
    weather: r.weather,
    actor: r.wallet,
    signature: r.signature,
    logIndex: r.logIndex,
    slot: r.slot,
    mint: r.mint,
    at: new Date(r.blockTime).toISOString(),
    identity: buildRadarIdentity(r.wallet, r.element),
  };
}

async function fetchEvents(base: string, limit: number): Promise<RadarMintActivity[]> {
  try {
    const res = await fetch(`${base}/events/recent?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[radar-source] /events/recent responded ${res.status}`);
      return [];
    }
    const body = (await res.json()) as RadarEventsResponse;
    return body.events ?? [];
  } catch (err) {
    console.warn(`[radar-source] fetch failed: ${(err as Error).message}`);
    return [];
  }
}

async function tick(
  base: string,
  limit: number,
  onEvent: (m: MintActivity) => void,
): Promise<void> {
  const radarEvents = await fetchEvents(base, limit);
  if (radarEvents.length === 0) return;

  // Radar returns newest-first; reverse so subscribers receive oldest-first
  // (matches the natural "events arriving in chronological order" pattern
  // the rail expects).
  for (const r of radarEvents.slice().reverse()) {
    if (seenSignatures.has(r.signature)) continue;
    const mint = toMintActivity(r);
    if (!mint) {
      seenSignatures.add(r.signature);
      continue;
    }
    seenSignatures.add(r.signature);
    onEvent(mint);
  }
}

/**
 * Idempotent. First call (in the browser) starts polling. Subsequent
 * calls are no-ops. Returns true if polling is active (or just started),
 * false if disabled (no DATABASE_URL... err, `NEXT_PUBLIC_RADAR_URL`).
 */
export function startRadarPolling(onEvent: (m: MintActivity) => void): boolean {
  if (typeof window === "undefined") return false;
  if (started) return pollHandle !== null;
  started = true;

  const base = radarUrl();
  if (!base) {
    console.log("[radar-source] NEXT_PUBLIC_RADAR_URL not set — skipping live indexer");
    return false;
  }

  console.log(`[radar-source] polling ${base}/events/recent every ${POLL_INTERVAL_MS / 1000}s`);

  // Initial hydration: fetch the larger HISTORY_LIMIT once so the rail
  // boots with the full backfill from radar's ring buffer / DB.
  void tick(base, HISTORY_LIMIT, onEvent);

  pollHandle = setInterval(() => {
    void tick(base, POLL_LIMIT, onEvent);
  }, POLL_INTERVAL_MS);

  return true;
}

/** Test/teardown helper — clears the poller state so it can be restarted. */
export function _resetRadarPollingForTests(): void {
  if (pollHandle) clearInterval(pollHandle);
  pollHandle = null;
  started = false;
  seenSignatures.clear();
}
