import type { StorybookConfig } from "@storybook-astro/framework";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const compatibilityHead = `<script id="storybook-webcrypto-compat">${readFileSync(new URL("./webcrypto-compatibility.js", import.meta.url), "utf8")}</script>`;

const config: StorybookConfig = {
  framework: {
    name: "@storybook-astro/framework",
    options: { renderMode: "static" },
  },
  stories: ["../src/design-system/**/*.stories.ts"],
  addons: ["@storybook/addon-a11y"],
  staticDirs: [
    { from: "../src/design-system/fonts", to: "/amber-fonts" },
    { from: "../src/design-system/stories/assets", to: "/attachments" },
  ],
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
    actions: false,
    interactions: false,
  },
  previewHead: (head) => `${compatibilityHead}${head}`,
  managerHead: (head) => {
    // The manager isn't built by Vite, so pass CSS as data instead of using ?raw there.
    const css = readFileSync(new URL("../src/design-system/tokens.css", import.meta.url), "utf8");
    const data = JSON.stringify(css).replaceAll("<", "\\u003c");
    return `${compatibilityHead}${head}<script id="amber-token-source" type="application/json">${data}</script>`;
  },
  core: {
    disableTelemetry: true,
    builder: {
      name: "@storybook/builder-vite",
      options: { viteConfigPath: ".storybook/vite.config.ts" },
    },
  },
  viteFinal: (config) => ({
    ...config,
    // Astro merges defaults over the builder's cache/public settings.
    // Keep the browser optimizer separate from the internal Astro SSR server.
    cacheDir: fileURLToPath(new URL("../node_modules/.cache/storybook-amber", import.meta.url)),
    publicDir: false,
    optimizeDeps: {
      ...config.optimizeDeps,
      // The published renderer bundles this helper; it isn't an app dependency.
      include: config.optimizeDeps?.include?.filter((name) => name !== "ts-dedent"),
    },
  }),
};

export default config;
