import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { updateImageUrls, updateMdLinkUrls } from "../../libs/remark-plugins";

export default defineConfig({
  integrations: [],

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
