import { defineConfig } from "astro/config";
import { updateImageUrls, updateMdLinkUrls } from "../../libs/remark-plugins";

// import rehypeSlug from "rehype-slug";
// import rehypeAutolinkHeadings from "rehype-autolink-headings";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  outDir: "../../dist/apps/chiubaca.com",
  integrations: [],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    remarkPlugins: [updateMdLinkUrls, updateImageUrls],
    // rehypePlugins: [
    //   rehypeSlug,
    //   () => rehypeAutolinkHeadings({ behavior: "append" }),
    // ],
  },

  site: "https://chiubaca.com",

  adapter: cloudflare(),
});
