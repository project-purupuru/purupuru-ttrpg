import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace packages so Next.js can resolve TypeScript source
  // (Sprint-1 · S1-T5..T8 · routes import from packages/* directly).
  transpilePackages: [
    "@purupuru/peripheral-events",
    "@purupuru/world-sources",
    "@purupuru/medium-blink",
  ],
};

export default nextConfig;
