# VK-07 pose viewer

From the monorepo root, run `pnpm exec vp install` and `pnpm --filter mecha-v2.chiubaca.com dev`, then open the local URL. Hover over the model or system map to scan, click or tap to lock, and drag to orbit the frame or the locked part. Press `Escape` to reset the view, or use `1`, `2`, and `3` to switch poses. Some systems have an exploded view. The viewer honors the system's reduced-motion preference.

Run `pnpm --filter mecha-v2.chiubaca.com build` to produce a static site in `dist/`. Run `pnpm --filter mecha-v2.chiubaca.com deploy` to build and publish it to `mecha-v2.chiubaca.com` using Cloudflare Workers Static Assets.

The viewer uses a single GLB and three sets of joint transforms. The Blender export separates the chest shells, shield face, wing binders, and antennae into independently movable sections. The original Blend files are in the separate `winged-mech` modeling project. To refresh the assets, run this from the monorepo root (adjust the Blender project path if needed):

```sh
blender -b ../winged-mech/winged_mech_rifle_97pct.blend --python-exit-code 1 --python apps/mecha-v2.chiubaca.com/scripts/export_web.py -- ../winged-mech
```
