import cloudflare from "@astrojs/cloudflare";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";
import { defineConfig } from "astro/config";

import { updateImageUrls, updateMdLinkUrls, autolinkHeadings } from "../../libs/remark-plugins";

export default defineConfig({
  integrations: [alpinejs()],

  vite: {
    plugins: [...tailwindcss()] as any,
  },

  markdown: {
    processor: satteri({
      mdastPlugins: [updateMdLinkUrls, updateImageUrls],
      hastPlugins: [autolinkHeadings()],
    }),
    shikiConfig: {
      theme: "dracula",
    },
  },

  site: "https://chiubaca.com",

  adapter: cloudflare(),
});
