# Mobile Suit // Hangar 01

An interactive wireframe mobile suit with an in-universe parts manifest. Hover over the model or system map to scan a part, click or tap to lock on, and press Escape or **Reset View** to return to the full suit.

Both hangars read their part names and lore from `libs/mecha-systems/catalog.json`. This viewer's geometry and camera shots are defined in `src/components/GundamModel.tsx` and `src/data/skills.ts`.

Run these commands from the monorepo root:

```bash
pnpm exec vp install
pnpm --filter mecha.chiubaca.com dev
pnpm --filter mecha.chiubaca.com build
pnpm mecha.chiubaca.com:deploy
```
