import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { updateMdLinkUrls, updateImageUrls } from "../../libs/remark-plugins";

// https://astro.build/config
export default defineConfig({
  outDir: "../../dist/apps/notes.chiubaca.com",
  integrations: [tailwind()],
  markdown: {
    remarkPlugins: [updateMdLinkUrls, updateImageUrls],
  },
});
