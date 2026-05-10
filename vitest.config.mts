import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    // node env — pentagram + sim tests are DOM-free.
    // Component tests will switch to jsdom or happy-dom when added;
    // jsdom 29 currently has an ESM mismatch with Node 20.
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts", "components/**/*.{ts,tsx}"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
