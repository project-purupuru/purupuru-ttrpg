"use client";

/**
 * CardPetal — individual card view. FR-5.
 *
 * Element-driven art layers · holographic-tilt on hover (mouse-position
 * transform) · rarity-treatment frame · uses asset library (when S6 wires
 * full sync · for now compass's existing public/art/cards/ local copies).
 */

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useCallback } from "react";
import type { Card } from "@/lib/honeycomb/cards";
import { ELEMENT_META } from "@/lib/honeycomb/wuxing";
import { ResilientImage } from "./_asset";
import { ELEMENT_TINT_BG } from "./_element-classes";

interface CardPetalProps {
  readonly card: Card;
  readonly facing?: "up" | "down";
  readonly stamped?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
}

export function CardPetal({
  card,
  facing = "up",
  stamped = false,
  onClick,
  className,
}: CardPetalProps) {
  // Holographic tilt via mouse position
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotX = useSpring(useTransform(mouseY, [0, 1], [12, -12]), { stiffness: 320, damping: 22 });
  const rotY = useSpring(useTransform(mouseX, [0, 1], [-12, 12]), { stiffness: 320, damping: 22 });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - r.left) / r.width);
      mouseY.set((e.clientY - r.top) / r.height);
    },
    [mouseX, mouseY],
  );
  const onMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  // Asset path for this card. Uses puruhani sprite for caretaker_a/b · jani
  // sprite for jani · placeholder gradient for transcendence (S6 art wire).
  const assetPath = facing === "up" ? assetPathFor(card) : null;

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={[
        "relative aspect-[3/4] rounded-2xl shadow-puru-tile cursor-pointer overflow-hidden",
        ELEMENT_TINT_BG[card.element],
        className ?? "",
      ].join(" ")}
      data-element={card.element}
      data-cardtype={card.cardType}
      data-stamped={stamped}
    >
      {facing === "up" && assetPath && (
        <ResilientImage
          src={assetPath}
          alt={`${ELEMENT_META[card.element].name} · ${card.cardType}`}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
      )}

      {/* Element kanji watermark */}
      <span
        aria-hidden
        className="absolute top-2 left-2 font-puru-display text-2xl text-puru-ink-rich z-10"
      >
        {ELEMENT_META[card.element].kanji}
      </span>

      {/* Card type chip */}
      <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-full bg-puru-cloud-bright/80 text-2xs font-puru-mono uppercase tracking-wide text-puru-ink-dim">
        {card.cardType === "caretaker_a"
          ? "ca · a"
          : card.cardType === "caretaker_b"
            ? "ca · b"
            : card.cardType}
      </span>

      {/* Name label */}
      <span className="absolute bottom-2 left-2 right-2 z-10 text-2xs font-puru-display text-puru-ink-rich text-center truncate">
        {card.cardType === "jani"
          ? `Jani · ${card.element}`
          : card.cardType === "transcendence"
            ? card.defId.replace("transcendence-", "")
            : ELEMENT_META[card.element].caretaker}
      </span>

      {/* 敗 stamp on disintegrate */}
      {stamped && (
        <motion.div
          initial={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 grid place-items-center bg-puru-ink-rich/40 z-20"
        >
          <span className="font-puru-display text-6xl text-puru-fire-vivid">敗</span>
        </motion.div>
      )}

      {/* Card back face when face-down */}
      {facing === "down" && (
        <div className="absolute inset-0 bg-puru-cloud-deep grid place-items-center z-30">
          <span className="font-puru-display text-3xl text-puru-ink-ghost">·</span>
        </div>
      )}
    </motion.div>
  );
}

function assetPathFor(card: Card): string | null {
  // Map card to its sprite per compass's existing public/art/* convention.
  switch (card.cardType) {
    case "jani":
      return `/art/jani/jani-${card.element}.png`;
    case "caretaker_a":
    case "caretaker_b":
      return `/art/puruhani/puruhani-${card.element}.png`;
    case "transcendence":
      // Transcendence art comes from S6 asset extraction; no local copy yet.
      return null;
  }
}
