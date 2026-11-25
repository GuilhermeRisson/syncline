import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { conditions: ["source"] },
  test: {
    projects: [
      { test: { name: "core", include: ["packages/core/src/**/*.test.ts"] } },
      { test: { name: "client", include: ["packages/client/src/**/*.test.ts"] } },
      { test: { name: "server", include: ["packages/server/src/**/*.test.ts"] } },
      { test: { name: "e2e", include: ["tests/e2e/**/*.test.ts"] } },
    ],
  },
});
