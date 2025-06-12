import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { updateImageUrls, updateMdLinkUrls } from "../../libs/remark-plugins";

import opengraphImages, { presets } from "astro-opengraph-images";
import * as fs from "node:fs"; // The fs module is required to load fonts

export default defineConfig({
  integrations: [
    alpinejs(),
    opengraphImages({
      render: presets.simpleBlog,
      options: {
        fonts: [
          {
            name: "Roboto",
            data: fs.readFileSync("public/Roboto-Regular.ttf"),
          },
        ],
      },
    }),
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
