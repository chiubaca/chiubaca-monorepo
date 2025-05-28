import { defineConfig } from "astro/config";
// import tailwind from "@astrojs/tailwind";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { updateImageUrls, updateMdLinkUrls } from "../../libs/remark-plugins";

// import rehypeSlug from "rehype-slug";
// import rehypeAutolinkHeadings from "rehype-autolink-headings";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
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
  redirects: {
    "/using-javascript-to-write-postgresql-functions-1ac":
      "/using-javascript-to-write-postgresql-functions",

    "/how-use-npm-modules-client-side-in-astrojs-3m37":
      "/how-use-npm-modules-client-side-in-astrojs",

    "/build-a-serverless-crud-app-using-vue-js-netlify-and-faunadb-5dno":
      "/build-a-serverless-crud-app-using-vue-js-netlify-and-faunadb",

    "/building-my-new-blog-nuxt-vs-gridsome-4n9g":
      "building-my-new-blog-nuxt-vs-gridsome",

    "/easy-react-data-fetching-with-use-16jg": "/quick-look-at-react-use-hook",

    "/typescript-and-netlify-functions-37b8":
      "/typescript-and-netlify-functions",

    "/controlling-my-anxiety-insomnia-1fc7": "/controlling-my-anxiety-insomnia",

    "/managing-your-self-learning-1dpc": "/managing-your-self-learning",
  },
});
