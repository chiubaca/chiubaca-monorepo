# VK-07 pose viewer

From the monorepo root, run `pnpm exec vp install` and `pnpm --filter mecha-v2.chiubaca.com dev`, then open the local URL. Use the pose buttons or keys `1`, `2`, and `3`. The live camera and pose animate together. The viewer honors the system's reduced-motion preference.

Run `pnpm --filter mecha-v2.chiubaca.com build` to produce a static site in `dist/`. Run `pnpm --filter mecha-v2.chiubaca.com deploy` to build and publish it to `mecha-v2.chiubaca.com` using Cloudflare Workers Static Assets.

The viewer uses a single GLB and three sets of joint transforms. The original Blend files and export script are in the separate `winged-mech` modeling project. To refresh the assets, run this from that project, adjusting the output path if needed:

```sh
blender -b winged_mech_rifle_97pct.blend --python-exit-code 1 --python scripts/export_web.py -- ../chiubaca-monorepo/apps/mecha-v2.chiubaca.com/public/assets
```
