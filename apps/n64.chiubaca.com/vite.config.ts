import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

// The deployable site lives in public/ and Wrangler serves that folder directly.
// Use it as Vite's root so the existing index.html gets HMR in dev, while
// textures and images keep their current /textures/... URLs.
const siteRoot = fileURLToPath(new URL("./public", import.meta.url));

export default defineConfig({
  root: siteRoot,
  publicDir: false,
  server: {
    host: true, // bind 0.0.0.0 so the Tailscale IP is reachable
    port: 5173,
    strictPort: true,
    allowedHosts: true, // allow requests to the tailnet hostname/IP
  },
});
