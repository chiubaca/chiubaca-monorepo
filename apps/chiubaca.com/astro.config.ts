import cloudflare from "@astrojs/cloudflare";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { createMarkdownOptions } from "./src/lib/markdown-config";

export default defineConfig({
  integrations: [alpinejs()],

  vite: {
    plugins: [...tailwindcss()] as any,
  },

  markdown: createMarkdownOptions(),

  site: "https://chiubaca.com",

  adapter: cloudflare(),
});
