"use client";

import Image from "next/image";
import { SoundToggle } from "./SoundToggle";

export function TopBar({
  soundEnabled,
  onToggleSound,
}: {
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-puru-surface-border bg-puru-cloud-bright shadow-puru-tile px-8">
      <span className="puru-wordmark-drift inline-flex">
        <Image
          src="/brand/purupuru-wordmark.svg"
          alt="purupuru"
          width={88}
          height={28}
          priority
          className="dark:hidden"
        />
        <Image
          src="/brand/purupuru-wordmark-white.svg"
          alt="purupuru"
          width={88}
          height={28}
          priority
          className="hidden dark:block"
        />
      </span>
      <SoundToggle enabled={soundEnabled} onToggle={onToggleSound} />
    </header>
  );
}
