import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import og from "astro-og";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

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
  },

  site: "https://chiubaca.com",

  adapter: cloudflare(),
});
