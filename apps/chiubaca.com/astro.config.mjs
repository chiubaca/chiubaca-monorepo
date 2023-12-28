import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  outDir: "../../dist/apps/chiubaca.com",
  integrations: [tailwind()],
});
