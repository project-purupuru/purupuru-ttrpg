"use client";

export function ActivityRail() {
  return (
    <aside className="flex flex-col border-l border-puru-cloud-dim bg-puru-cloud-bright">
      <header className="border-b border-puru-cloud-dim px-5 py-4">
        <h3 className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
          recent activity
        </h3>
        <p className="mt-1 font-puru-display text-base text-puru-ink-rich">
          live across the cycle
        </p>
      </header>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <p className="font-puru-mono text-xs uppercase tracking-[0.18em] text-puru-ink-dim">
          awaiting first event
        </p>
      </div>
    </aside>
  );
}
