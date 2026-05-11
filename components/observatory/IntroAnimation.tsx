"use client";

/**
 * Intro / entry screen.
 *
 * Three stages:
 *   1. `logo`     — fade-in, wordmark centered, holds briefly.
 *   2. `buttons`  — buttons fade in below; logo shifts up via flex
 *                   reflow as the column grows.
 *   3. `exit`     — whole overlay fades out and unmounts; parent's
 *                   `onDone` fires from AnimatePresence's onExitComplete.
 *
 * Pre-connect: two buttons — `Connect Wallet` (opens the wallet modal)
 * and `Enter as guest` (skips wallet). Post-connect (or auto-connect
 * from prior session): single `Enter →` button + a small "connected
 * as <truncated>" label.
 *
 * Reduced-motion: skips the whole animation, fires `onDone` immediately.
 *
 * Styling: follows the puru design system (cloud-base canvas,
 * fire-vivid primary accent, font-puru-mono uppercase tracking for
 * button labels). No wallet-adapter-react-ui default purple gradient
 * appears in the entry UI — its modal does pop up on connect-click
 * but it's user-action-bound so the brand-cloud entry surface stays
 * brand-consistent.
 */

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const LOGO_TO_BUTTONS_DELAY_MS = 1200;

type Stage = "logo" | "buttons" | "exit";

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const { publicKey, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const connected = publicKey !== null;
  const [stage, setStage] = useState<Stage>("logo");

  // Reduced motion: skip the choreography entirely.
  useEffect(() => {
    if (reduce) onDone();
  }, [reduce, onDone]);

  // Advance logo → buttons after the hold delay.
  useEffect(() => {
    if (reduce) return;
    if (stage !== "logo") return;
    const t = window.setTimeout(() => setStage("buttons"), LOGO_TO_BUTTONS_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [stage, reduce]);

  if (reduce) return null;

  const handleEnter = () => setStage("exit");
  const handleConnect = () => setVisible(true);

  const truncated = publicKey ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}` : "";

  return (
    <AnimatePresence onExitComplete={onDone}>
      {stage !== "exit" && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="pointer-events-auto fixed inset-0 z-30 flex flex-col items-center justify-center gap-10 bg-puru-cloud-base px-6"
        >
          {/* Wordmark — always rendered. Reflow when buttons mount
              naturally pushes it up since the flex column is justify-
              center. */}
          <div>
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
          </div>

          {/* Action panel — appears after the logo holds, fades + slides
              in from below. */}
          <AnimatePresence>
            {stage === "buttons" && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="flex w-full max-w-xs flex-col gap-2.5"
              >
                {connected ? (
                  <>
                    <button
                      type="button"
                      onClick={handleEnter}
                      className="rounded-puru-sm border border-puru-fire-vivid bg-puru-fire-tint px-6 py-3.5 font-puru-mono text-xs uppercase tracking-[0.22em] text-puru-fire-vivid shadow-puru-tile transition-colors hover:bg-puru-fire-pastel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puru-fire-vivid"
                    >
                      Enter →
                    </button>
                    <p className="text-center font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim">
                      connected · {truncated}
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleConnect}
                      disabled={connecting}
                      className="rounded-puru-sm border border-puru-surface-border bg-puru-cloud-bright px-6 py-3.5 font-puru-mono text-xs uppercase tracking-[0.22em] text-puru-ink-rich shadow-puru-tile transition-colors hover:border-puru-fire-vivid hover:bg-puru-fire-tint hover:text-puru-fire-vivid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puru-fire-vivid disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {connecting ? "Connecting…" : "Connect Wallet"}
                    </button>
                    <button
                      type="button"
                      onClick={handleEnter}
                      className="rounded-puru-sm px-6 py-2.5 font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim transition-colors hover:text-puru-ink-rich focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puru-surface-border"
                    >
                      Enter as guest
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
