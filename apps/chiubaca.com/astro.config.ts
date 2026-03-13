import alpinejs from "@astrojs/alpinejs";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import og from "astro-og";
import { defineConfig } from "astro/config";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

import { updateImageUrls, updateMdLinkUrls } from "../../libs/remark-plugins";

export default defineConfig({
  integrations: [
    alpinejs(), // https://alpinejs.dev/
    og(), // https://github.com/morinokami/astro-og
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    remarkPlugins: [updateMdLinkUrls, updateImageUrls],
    rehypePlugins: [
      rehypeSlug,
      () => rehypeAutolinkHeadings({ behavior: "append" }),
    ],
    shikiConfig: {
      theme: "dracula",
    },
  },

  site: "https://chiubaca.com",

  adapter: cloudflare(),
});
