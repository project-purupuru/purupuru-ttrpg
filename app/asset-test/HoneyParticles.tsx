"use client";

// Ported from project-purupuru/world-purupuru
// sites/world/src/lib/chat/HoneyParticles.svelte. Same particle math —
// 24 honey-gold motes with detuned curl/transverse/breath sinusoids.

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  baseOpacity: number;
}

const PARTICLE_COUNT = 24;

export function HoneyParticles({ count = PARTICLE_COUNT }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
      baseOpacity: Math.random() * 0.3 + 0.25,
    }));

    let frame = 0;
    const draw = (t: number) => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      for (const p of particles) {
        p.x += p.vx + Math.sin(t * 0.0008 + p.phase) * 0.15;
        p.y += p.vy + Math.cos(t * 0.0006 + p.phase * 1.3) * 0.12;

        if (p.x < -4) p.x = cw + 4;
        if (p.x > cw + 4) p.x = -4;
        if (p.y < -4) p.y = ch + 4;
        if (p.y > ch + 4) p.y = -4;

        const breath = Math.sin(t * 0.0015 + p.phase) * 0.2;
        const opacity = p.baseOpacity + breath;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 170, 60, ${opacity})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
