"use client";

import { useMemo } from "react";
import type { Element } from "@/lib/score";
import type { AvatarSeed } from "@/lib/sim/types";
import { avatarSVG } from "@/lib/sim/avatar";

/**
 * Inline-SVG honey-blob avatar. The SVG markup is built from numeric
 * seeds + a closed Element vocabulary, so dangerouslySetInnerHTML is
 * safe — no caller-supplied strings reach the rendered output.
 */
export function PuruhaniAvatar({
  seed,
  primary,
  affinity,
  size = 36,
}: {
  seed: AvatarSeed;
  primary: Element;
  affinity?: Element;
  size?: number;
}) {
  const html = useMemo(
    () => avatarSVG(seed, primary, affinity ?? primary, size),
    [seed, primary, affinity, size],
  );
  return (
    <span
      aria-hidden
      className="shrink-0"
      style={{ width: size, height: size, display: "inline-block", lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
