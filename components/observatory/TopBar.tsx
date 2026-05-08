"use client";

import Image from "next/image";

export function TopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-puru-cloud-dim bg-puru-cloud-bright px-8">
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
    </header>
  );
}
