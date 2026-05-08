"use client";

import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

/**
 * Sound toggle for the ambient pentatonic sonification. Off by default
 * (browser autoplay policy + user respect). The first click also doubles
 * as the user gesture that resumes the AudioContext.
 */
export function SoundToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={enabled ? "mute ambient sound" : "enable ambient sound"}
      aria-pressed={enabled}
      title={enabled ? "ambient sound on" : "ambient sound off"}
      className="flex h-9 w-9 items-center justify-center rounded-puru-sm text-puru-ink-soft transition-colors hover:bg-puru-cloud-base hover:text-puru-ink-rich focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puru-fire-vivid"
    >
      {enabled ? (
        <SpeakerHigh weight="fill" size={18} />
      ) : (
        <SpeakerSlash weight="fill" size={18} />
      )}
    </button>
  );
}
