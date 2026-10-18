import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vite-plus/test/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          GITHUB_CLIENT_ID: "test-github-client-id",
          GITHUB_CLIENT_SECRET: "test-github-client-secret",
          NOTES_GITHUB_TOKEN: "test-notes-token",
        },
      },
    }),
  ],
  test: {
    include: ["test/**/*.test.ts"],
  },
});
