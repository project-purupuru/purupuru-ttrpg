"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Compact KPI card used in the right-rail panels (Activity / Weather).
 *
 * Renders a small uppercase mono label, a primary value, an optional
 * inline "aside" (typically a glyph or kanji), and an optional sub-line
 * for a secondary detail. Tab-stable layout via tabular-nums on the
 * value so consecutive numeric reads don't shift the row.
 *
 * `asideStyle` accepts inline CSS for cases that need a runtime token
 * lookup (e.g. element-tinted color via `var(--puru-${el}-vivid)`) —
 * Tailwind's JIT can't resolve those at build time.
 */
export function KpiCell({
  label,
  value,
  aside,
  sub,
  asideStyle,
}: {
  label: string;
  value: ReactNode;
  /** Inline element shown next to the value — glyph, kanji, or units. */
  aside?: ReactNode;
  /** Secondary detail line under the primary value (precipitation, factor, etc). */
  sub?: ReactNode;
  /** Inline style applied to the aside slot — typically used for element color. */
  asideStyle?: CSSProperties;
}) {
  return (
    <div className="relative flex min-w-0 flex-col gap-1 overflow-hidden rounded-puru-sm bg-puru-cloud-bright px-3 py-2 shadow-puru-tile">
      <span className="relative z-10 truncate font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
        {label}
      </span>
      <span className="relative z-10 truncate font-puru-mono text-xl leading-none tabular-nums text-puru-ink-rich">
        {value}
      </span>
      {sub !== undefined && sub !== null ? (
        <span className="relative z-10 truncate font-puru-mono text-2xs text-puru-ink-soft">
          {sub}
        </span>
      ) : null}
      {aside !== undefined && aside !== null ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-2 -right-1 select-none font-puru-display text-5xl leading-none opacity-10"
          style={asideStyle}
        >
          {aside}
        </span>
      ) : null}
    </div>
  );
}
