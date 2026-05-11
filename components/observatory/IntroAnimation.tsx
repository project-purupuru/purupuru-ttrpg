"use client";

/**
 * Intro / entry screen.
 *
 * The overlay's bg-puru-cloud-base layer is solid from frame 0 — the
 * observatory mounts behind it but is never visible until the exit
 * fade. Only the contents (logo, then buttons) animate in over the
 * solid backdrop.
 *
 * Three stages:
 *   1. `logo`     — wordmark fades + softly scales in over solid bg.
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
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const LOGO_TO_BUTTONS_DELAY_MS = 1200;
/** Brief beat to acknowledge the connected wallet before auto-exiting. */
const CONNECTED_AUTO_ENTER_MS = 500;

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

  // Read latest `connected` inside the timer body without making the
  // logo-stage timer reset whenever the wallet state flips. Otherwise a
  // mid-hold autoConnect resolution would restart the 1.2s timer.
  const connectedRef = useRef(connected);
  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  // Advance the logo stage after the hold delay. If the wallet has already
  // auto-connected by then, skip the buttons stage entirely and exit
  // straight to the app (logo → app). Otherwise show the connect/guest
  // actions.
  useEffect(() => {
    if (reduce) return;
    if (stage !== "logo") return;
    const t = window.setTimeout(() => {
      setStage(connectedRef.current ? "exit" : "buttons");
    }, LOGO_TO_BUTTONS_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [stage, reduce]);

  // Auto-enter when the user finishes connecting mid-buttons-stage. They
  // clicked Connect Wallet, the modal opened, and now the wallet is live —
  // exit after a brief beat showing the "connected · 4abc…" acknowledgment
  // so they aren't asked for a second click.
  useEffect(() => {
    if (reduce) return;
    if (!connected) return;
    if (stage !== "buttons") return;
    const t = window.setTimeout(() => setStage("exit"), CONNECTED_AUTO_ENTER_MS);
    return () => window.clearTimeout(t);
  }, [connected, stage, reduce]);

  if (reduce) return null;

  const handleEnter = () => setStage("exit");
  const handleConnect = () => setVisible(true);

  const truncated = publicKey ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}` : "";

  return (
    <AnimatePresence onExitComplete={onDone}>
      {stage !== "exit" && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="pointer-events-auto fixed inset-0 z-30 flex flex-col items-center justify-center gap-12 bg-puru-cloud-base px-6 md:gap-14"
        >
          {/* Wordmark — fades + softly scales in over the solid bg.
              Reflow when buttons mount naturally pushes it up since
              the flex column is justify-center. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
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
                  <p className="text-center font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim">
                    connected · {truncated} · entering…
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleConnect}
                      disabled={connecting}
                      className="rounded-puru-sm border border-puru-ink-soft bg-puru-cloud-bright px-6 py-3.5 font-puru-mono text-xs uppercase tracking-[0.22em] text-puru-ink-rich shadow-puru-tile transition-[background-color,border-color,box-shadow] hover:border-puru-ink-rich hover:bg-puru-cloud-dim hover:shadow-puru-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puru-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
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
