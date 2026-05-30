import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/__generated__/**",
          "src/routeTree.gen.ts",
          "src/**/*.stories.{ts,tsx}",
          "src/**/*.test.{ts,tsx}",
        ],
      },
      projects: [
        // Storybook smoke & interaction tests (real browser via Playwright)
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
              storybookScript: "pnpm storybook --no-open",
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              provider: playwright({}),
              headless: true,
              instances: [{ browser: "chromium" }],
            },
            // Shiki's WASM engine fails in Vitest browser mode
            exclude: ["src/components/code/file-viewer.stories.tsx"],
          },
        },
        // Snapshot tests (happy-dom, fast)
        {
          extends: true,
          test: {
            name: "snapshot",
            include: ["src/**/*.test.{ts,tsx}"],
            environment: "happy-dom",
            setupFiles: ["./.storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  }),
);
