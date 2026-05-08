"use client";

import Image from "next/image";

export function TopBar({ activeCount }: { activeCount: number }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-puru-cloud-dim bg-puru-cloud-bright px-6">
      <div className="flex items-center gap-3">
        <Image
          src="/brand/purupuru-wordmark.svg"
          alt="purupuru"
          width={120}
          height={40}
          priority
          className="dark:hidden"
        />
        <Image
          src="/brand/purupuru-wordmark-white.svg"
          alt="purupuru"
          width={120}
          height={40}
          priority
          className="hidden dark:block"
        />
        <span className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
          observatory
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
            active
          </span>
          <span className="font-puru-mono text-base tabular-nums text-puru-ink-rich">
            {activeCount.toLocaleString()}
          </span>
        </div>
        <span
          aria-label="live"
          className="h-2.5 w-2.5 rounded-full bg-puru-fire-vivid"
        />
      </div>
    </header>
  );
}
