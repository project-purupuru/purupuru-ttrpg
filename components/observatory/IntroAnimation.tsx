"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  if (reduce) {
    queueMicrotask(onDone);
    return null;
  }
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onDone}
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-puru-cloud-base"
    >
      <Image
        src="/brand/purupuru-wordmark.svg"
        alt="purupuru"
        width={320}
        height={120}
        priority
        className="dark:hidden"
      />
      <Image
        src="/brand/purupuru-wordmark-white.svg"
        alt="purupuru"
        width={320}
        height={120}
        priority
        className="hidden dark:block"
      />
    </motion.div>
  );
}
