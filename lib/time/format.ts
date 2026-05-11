/**
 * Relative-time formatting · single source of truth for the observatory's
 * "X ago" labels (activity rail timestamps, weather sync indicator, focus
 * card claim time, etc).
 *
 * Output buckets (lowercase; consumers apply `uppercase` via Tailwind
 * where the surface calls for it):
 *   < 5s        → "just now"
 *   < 60s       → "Xs ago"
 *   < 60m       → "Xm ago"
 *   < 24h       → "Xh ago"
 *   < 7d        → "Xd ago"
 *   ≥ 7d        → "Mon D" (e.g. "May 9") via Intl.DateTimeFormat
 *
 * Edge cases: NaN inputs (invalid ISO) → "—" sentinel matching the empty-
 * state convention elsewhere. Negative diffs (clock skew, future-dated
 * events) short-circuit to "just now" via the < 5s branch.
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const ABSOLUTE_DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function timeAgo(iso: string, now: number): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "—";
  const diff = now - ts;
  if (diff < 5 * SECOND) return "just now";
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  return ABSOLUTE_DATE_FMT.format(ts);
}
