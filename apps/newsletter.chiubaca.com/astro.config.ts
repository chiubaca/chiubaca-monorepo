import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://newsletter.chiubaca.com",
  server: {
    port: 4322,
  },
});
