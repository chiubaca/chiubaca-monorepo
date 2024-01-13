import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { updateMdLinkUrls, updateImageUrls } from "../../libs/remark-plugins";


import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";


// https://astro.build/config
export default defineConfig({
  outDir: "../../dist/apps/notes.chiubaca.com",
  integrations: [tailwind()],
  markdown: {
    remarkPlugins: [updateMdLinkUrls, updateImageUrls],
    rehypePlugins: [
      rehypeSlug,
      () =>
        rehypeAutolinkHeadings({
          behavior: "wrap",
          content: { type: "text", value: "🔗" },
        }),
    ],
  },
});
