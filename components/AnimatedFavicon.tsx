"use client";

import { useEffect } from "react";
import { timeElementId, type ElementId } from "@/lib/element-time";

const ELEMENT_IDS: ElementId[] = ["wood", "fire", "earth", "metal", "water"];

const JANI_FACES: Record<ElementId, string> = {
  wood: "/art/jani/jani-wood.png",
  fire: "/art/jani/jani-fire.png",
  earth: "/art/jani/jani-earth.png",
  metal: "/art/jani/jani-metal.png",
  water: "/art/jani/jani-water.png",
};

const SIZE = 32;

const REST_BASE = 7500;
const REST_JITTER = 3000;

const REVEAL_OUT_STEPS = 8;
const REVEAL_OUT_MS = 60;
const REVEAL_BACK_STEPS = 10;
const REVEAL_BACK_MS = 60;

const HOLD = 900;

const GATHER_DIM_MS = 80;
const GATHER_PAUSE_MS = 120;

function restDuration(): number {
  return REST_BASE + Math.random() * REST_JITTER;
}

function generates(el: ElementId): ElementId {
  const i = ELEMENT_IDS.indexOf(el);
  return ELEMENT_IDS[(i + 1) % ELEMENT_IDS.length];
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeIn(t: number): number {
  return t * t;
}

function initAnimatedFavicon(): (() => void) | undefined {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const images: Partial<Record<ElementId, HTMLImageElement>> = {};
  let loaded = 0;
  let cancelled = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let lastHome: ElementId | "" = "";

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }

  function renderRadial(from: ElementId, to: ElementId, progress: number) {
    if (!ctx || !link) return;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const fromImg = images[from];
    if (fromImg) {
      ctx.globalAlpha = 1;
      ctx.drawImage(fromImg, 0, 0, SIZE, SIZE);
    }

    const toImg = images[to];
    if (toImg && progress > 0) {
      ctx.save();
      ctx.beginPath();
      const radius = progress * SIZE * 0.75;
      ctx.arc(SIZE / 2, SIZE / 2, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 1;
      ctx.drawImage(toImg, 0, 0, SIZE, SIZE);
      ctx.restore();
    }

    link.href = canvas.toDataURL("image/png");
  }

  function setFavicon(element: ElementId) {
    renderRadial(element, element, 0);
  }

  function reveal(
    from: ElementId,
    to: ElementId,
    steps: number,
    stepMs: number,
    easeFn: (t: number) => number,
    onDone: () => void,
  ) {
    let step = 0;
    function tick() {
      if (cancelled) return;
      step++;
      const t = step / steps;
      renderRadial(from, to, easeFn(t));
      if (step < steps) {
        timeout = setTimeout(tick, stepMs);
      } else {
        onDone();
      }
    }
    tick();
  }

  function gather(home: ElementId, onDone: () => void) {
    const homeImg = images[home];
    if (!ctx || !link || !homeImg) {
      onDone();
      return;
    }
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.globalAlpha = 0.88;
    ctx.drawImage(homeImg, 0, 0, SIZE, SIZE);
    ctx.globalAlpha = 1;
    link.href = canvas.toDataURL("image/png");

    timeout = setTimeout(() => {
      if (cancelled) return;
      setFavicon(home);
      timeout = setTimeout(onDone, GATHER_PAUSE_MS);
    }, GATHER_DIM_MS);
  }

  function breathe() {
    if (cancelled) return;

    if (document.hidden) {
      timeout = setTimeout(breathe, 1000);
      return;
    }

    const home = timeElementId();
    const neighbor = generates(home);

    if (lastHome && lastHome !== home) {
      reveal(lastHome, home, 15, 80, easeOut, () => {
        lastHome = home;
        timeout = setTimeout(breathe, restDuration());
      });
      return;
    }

    lastHome = home;

    gather(home, () => {
      reveal(home, neighbor, REVEAL_OUT_STEPS, REVEAL_OUT_MS, easeOut, () => {
        timeout = setTimeout(() => {
          if (cancelled) return;
          reveal(neighbor, home, REVEAL_BACK_STEPS, REVEAL_BACK_MS, easeIn, () => {
            timeout = setTimeout(breathe, restDuration());
          });
        }, HOLD);
      });
    });
  }

  ELEMENT_IDS.forEach((el) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      images[el] = img;
      loaded++;
      if (loaded === ELEMENT_IDS.length) {
        const home = timeElementId();
        lastHome = home;
        setFavicon(home);
        timeout = setTimeout(breathe, restDuration());
      }
    };
    img.src = JANI_FACES[el];
  });

  return () => {
    cancelled = true;
    if (timeout) clearTimeout(timeout);
  };
}

export function AnimatedFavicon() {
  useEffect(() => {
    const cleanup = initAnimatedFavicon();
    return cleanup;
  }, []);
  return null;
}
