// Theme resolution — single source of truth for "is the puru world night?"
//
// The observatory uses sunrise/sunset from the Open-Meteo weather feed
// (`lib/weather/live.ts:297` deriveIsNight) to flip <html data-theme>
// between "old-horai" (dark) and "day-horai" (light · sentinel that
// defeats the prefers-color-scheme:dark mirror in globals.css).
//
// The problem with weather-only resolution: the feed lands ~300-800ms
// after first paint. During that window the page renders with system
// preference, then snaps. This module is the pre-paint resolver — runs
// in an inline <script> before React boots, picking the best signal
// available at that exact moment:
//
//   1. Cookie `puru-theme` — set by ObservatoryClient after the first
//      successful weather fetch. Survives across visits and is read
//      server-side, so SSR-rendered HTML carries the correct
//      data-theme attribute already. Zero flash on return visits.
//   2. Cached sunrise/sunset in localStorage — written by the same
//      effect. Lets the resolver compute is_night with the user's
//      actual local boundary instead of a generic 6am/6pm guess.
//   3. Time-of-day heuristic — only on a true cold first visit.
//      6am-6pm in the user's local time = day. Wrong by at most
//      ~90 minutes around twilight; the weather feed corrects within
//      a second of mount.
//   4. prefers-color-scheme — final fallback (matches globals.css's
//      :root:not([data-theme]) + media query block).
//
// Why "puru-theme" cookie not just localStorage: Next.js App Router
// server components read cookies via next/headers but cannot read
// localStorage. The cookie is the SSR-readable signal that lets
// app/layout.tsx and app/demo/page.tsx render the correct chrome
// before any client JS runs.

export type ResolvedTheme = "old-horai" | "day-horai";

export const THEME_COOKIE = "puru-theme";
export const THEME_STORAGE_KEY = "puru-theme";
export const SUNRISE_STORAGE_KEY = "puru-sunrise-iso";
export const SUNSET_STORAGE_KEY = "puru-sunset-iso";

const DAY_HOUR_START = 6;
const DAY_HOUR_END = 18;

export function isNightFromSunBoundary(
  nowMs: number,
  sunriseIso?: string | null,
  sunsetIso?: string | null,
): boolean | null {
  if (!sunriseIso || !sunsetIso) return null;
  const sr = Date.parse(sunriseIso);
  const ss = Date.parse(sunsetIso);
  if (!Number.isFinite(sr) || !Number.isFinite(ss)) return null;
  // The cached sunrise/sunset is from the day of the last fetch. If
  // we're on a different calendar day in local time, fall back to the
  // hour-of-day heuristic — yesterday's boundary is wrong-by-a-day,
  // not just a few minutes off.
  const now = new Date(nowMs);
  const cachedDay = new Date(sr);
  if (
    now.getFullYear() !== cachedDay.getFullYear() ||
    now.getMonth() !== cachedDay.getMonth() ||
    now.getDate() !== cachedDay.getDate()
  ) {
    return null;
  }
  return nowMs < sr || nowMs >= ss;
}

export function isNightFromHour(nowMs: number): boolean {
  const hour = new Date(nowMs).getHours();
  return hour < DAY_HOUR_START || hour >= DAY_HOUR_END;
}

export function themeFromIsNight(isNight: boolean): ResolvedTheme {
  return isNight ? "old-horai" : "day-horai";
}
