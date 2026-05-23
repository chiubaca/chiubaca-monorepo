import cloudflare from "@astrojs/cloudflare";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

import { updateImageUrls, updateMdLinkUrls } from "../../libs/remark-plugins";

export default defineConfig({
  integrations: [alpinejs()],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    remarkPlugins: [updateMdLinkUrls, updateImageUrls],
    rehypePlugins: [rehypeSlug, () => rehypeAutolinkHeadings({ behavior: "append" })],
    shikiConfig: {
      theme: "dracula",
    },
  },

  site: "https://chiubaca.com",

  adapter: cloudflare(),
});
