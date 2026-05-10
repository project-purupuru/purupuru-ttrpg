"use client";

import { useState, type ReactNode } from "react";
import type { WeatherState } from "@/lib/weather";
import type { Element } from "@/lib/score";
import { ActivityRail } from "./ActivityRail";
import { WeatherTile } from "./WeatherTile";
import { StatsTile } from "./StatsTile";

type TabKey = "stats" | "activity" | "weather";

const TABS: { key: TabKey; label: string }[] = [
  { key: "stats", label: "Stats" },
  { key: "activity", label: "Activity" },
  { key: "weather", label: "Weather" },
];

/**
 * Mobile-only always-on split panel. Tab bar + the active tab's content
 * occupy the lower ~38dvh; the canvas pane above flexes to fill what's
 * left. Default tab is Activity (most engaging — the on-chain pulse the
 * canvas is animating).
 *
 * Tab styling reuses the design system's interactive-button vocabulary
 * (see MusicPlayer.tsx:158): each tab is a bordered `rounded-puru-sm`
 * chip sitting on a recessed `cloud-base` shelf inside the panel's
 * `cloud-bright` shell — same surface relationship the music player's
 * controls use. The active chip lifts to `cloud-bright` (matching the
 * content surface), gains the system's `shadow-puru-tile` raise, and
 * carries a `--puru-honey-base` border for the "selected" accent —
 * mirroring the kit page Jani roster's accented-item pattern. Eyebrow
 * typography (`font-puru-mono text-2xs uppercase tracking-[0.2em]`) is
 * the same eyebrow used by every label in the observatory UI.
 */
export function MobileBottomPanel({
  distribution,
  weather,
}: {
  distribution: Record<Element, number>;
  weather: WeatherState;
}) {
  const [active, setActive] = useState<TabKey>("activity");

  return (
    <section
      className="flex h-[38dvh] shrink-0 flex-col overflow-hidden border-t border-puru-surface-border bg-puru-cloud-bright lg:hidden"
      aria-label="observatory mobile panel"
    >
      <div
        id={`mobile-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`mobile-tab-${active}`}
        className="flex-1 min-h-0 overflow-hidden"
      >
        {active === "stats" ? (
          <MobilePanelShell>
            <StatsTile distribution={distribution} />
          </MobilePanelShell>
        ) : active === "activity" ? (
          <MobilePanelShell>
            <ActivityRail />
          </MobilePanelShell>
        ) : (
          <MobilePanelShell>
            <WeatherTile state={weather} />
          </MobilePanelShell>
        )}
      </div>

      <div
        role="tablist"
        aria-label="observatory sections"
        // Tabs anchored to the bottom edge for thumb reach (iOS HIG /
        // Material bottom-nav convention). border-t now divides the
        // shelf from the content above. Safe-area padding keeps the
        // chips clear of the iPhone home indicator.
        className="flex shrink-0 gap-1.5 border-t border-puru-surface-border bg-puru-cloud-base px-2 py-2"
        style={{ paddingBottom: "calc(0.5rem + var(--safe-bottom, 0px))" }}
      >
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`mobile-panel-${t.key}`}
              onClick={() => setActive(t.key)}
              // Inline fontSize guarantees the override regardless of
              // HMR cache or any inherited body-default font-size on
              // <button>; the Tailwind class is kept for theming
              // consistency with the rest of the codebase's eyebrow
              // utilities.
              style={{ fontSize: 12, lineHeight: 1 }}
              className={`flex flex-1 items-center justify-center rounded-puru-sm border px-3 py-3.5 font-puru-mono text-xs uppercase leading-none tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puru-honey-base ${
                isActive
                  ? "border-puru-honey-base bg-puru-cloud-bright text-puru-ink-rich shadow-puru-tile"
                  : "border-puru-surface-border bg-transparent text-puru-ink-soft hover:text-puru-ink-rich"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Suppresses the desktop-only border-l/border-t edges and the
 * `shadow-puru-tile` inset top-highlight that ActivityRail / WeatherTile
 * / StatsTile carry for their sidebar context. On mobile those borders
 * sit at the panel edges where the panel's own border-t already
 * separates it from the canvas, and the inset-top highlight from
 * shadow-puru-tile would draw a 1px line right at the top edge of the
 * content — so we strip both via a child selector wrapper.
 */
function MobilePanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-full min-h-0 [&_aside]:border-l-0 [&_aside]:shadow-none [&_section]:border-l-0 [&_section]:border-t-0 [&_section]:shadow-none">
      {children}
    </div>
  );
}
