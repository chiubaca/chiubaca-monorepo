import { defineConfig } from "vite-plus";

// The Astro framework supplies its renderer plugins; don't load the site runtime here.
export default defineConfig({ publicDir: false });
