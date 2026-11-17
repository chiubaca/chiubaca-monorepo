import { defineConfig } from "vite-plus";

export default defineConfig({
  assetsInclude: ["**/*.glb", "**/*.gltf"],
  server: {
    host: true, // bind 0.0.0.0 so the Tailscale hostname is reachable
    allowedHosts: ["chiubaca-ubuntu.eel-hoki.ts.net"],
  },
});
