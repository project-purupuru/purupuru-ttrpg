import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Scope · only our app + packages · NOT .claude/ framework tests OR anchor tests.
    include: [
      "lib/**/*.{test,spec}.{ts,tsx}",
      "packages/*/src/**/*.{test,spec}.{ts,tsx}",
      "packages/*/__tests__/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules/**",
      "**/.claude/**",
      "**/programs/**",
      "**/.next/**",
    ],
  },
})
