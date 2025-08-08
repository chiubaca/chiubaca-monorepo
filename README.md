#  chiubaca-monorepo 🐻

This monorepo for all my *.chiubaca.com sites.

## Apps 🌐

### apps/chiubaca.com 

- What it is: The public website for chiubaca.com built with Astro and deployed to Cloudflare.
- Notable config:
  - `astro.config.ts` uses Cloudflare adapter and custom remark plugins from `libs/remark-plugins` to rewrite Markdown links and images.
  - `wrangler.jsonc` serves the built `dist/` at the custom domain `chiubaca.com`.
- Content sources:
  - `apps/chiubaca.com/fleeting-notes/` and `apps/chiubaca.com/permanent-notes/`
  - Attachments copied to `apps/chiubaca.com/public/attachments/`
- Package scripts (in `apps/chiubaca.com/package.json`):
  - `dev` — Runs `astro dev` then `wrangler dev` (sequential). Use when iterating locally.
  - `build` — Builds static site with `astro build` into `dist/`.
  - `preview` — Serves the built site with `astro preview`.
  - `deploy` — Deploys the built site via `wrangler deploy`.
  - `format` — Formats `./src` with Biome.

### apps/notes.chiubaca.com

- What it is: A Cloudflare Worker that fronts/forwards to chiubaca.com.
  - `/` proxies to `https://chiubaca.com/fleeting-notes/` and injects a `<base href="/fleeting-notes/">` tag into HTML responses so relative links resolve correctly.
  - Other paths proxy through to `https://chiubaca.com/*`.
- Notable config:
  - `wrangler.jsonc` routes the worker to the custom domain `notes.chiubaca.com`.
  - `src/index.ts` contains the proxy logic and base-tag injection using `HTMLRewriter`.
- Package scripts (in `apps/notes.chiubaca.com/package.json`):
  - `dev` / `start` — Runs `wrangler dev` for local development.
  - `deploy` — Publishes the worker with `wrangler deploy`.
  - `test` — Runs `vitest` with the Cloudflare Workers pool.
  - `cf-typegen` — Generates type definitions for `Env` bindings via `wrangler types`.

## Libraries and utilities 🛠️

### libs/remark-plugins 🧪

Custom remark plugins used by `apps/chiubaca.com` during Markdown processing (exported via `libs/remark-plugins/index.ts`):

- `updateMdLinkUrls` — Converts Obsidian-style Markdown links that end with `.md` into absolute site paths without the extension.
  - Example: `fleeting-notes/2022-01-01.md` → `/fleeting-notes/2022-01-01`.
- `updateImageUrls` — Rewrites local Markdown image URLs to absolute site paths under `/attachments/` (skips external `https` images).
  - Example: `some/folder/image.png` → `/attachments/image.png`.

### libs/scripts/migrate-notes.sh 🚚

Copies notes and assets from a temporary clone into the website app:

- Copies `tmp-notes/permanent-notes/` → `apps/chiubaca.com/permanent-notes/`
- Copies `tmp-notes/fleeting-notes/` → `apps/chiubaca.com/fleeting-notes/`
- Copies `tmp-notes/attachments/*` → `apps/chiubaca.com/public/attachments/`

## Root package scripts (workspace-wide) 📜

All scripts below live in the root `package.json` and are intended to be run from the repo root with `pnpm run <script>`.

- `dev` — Runs `pnpm -r dev` to start `dev` in all workspace apps. ▶️
- `dev:chiubaca` — Runs `dev` for the `chiubaca.com` app only via a filter. 🎯
- `notes:download` — `git clone` the external notes repo into `tmp-notes/` (fresh clone; removes existing `tmp-notes/`). ⬇️
- `notes:sync` — `git pull` inside `tmp-notes/` to update the cloned notes. 🔄
- `notes:migrate` — Runs `bash libs/scripts/migrate-notes.sh` to copy notes and attachments into the website app. 🧳
- `chiubaca.com:build` — Runs `notes:download` + `notes:migrate`, then builds `apps/chiubaca.com`. 🏗️
- `chiubaca.com:deploy` — Runs the `deploy` script in `apps/chiubaca.com`. 🚀
- `preview` — Runs `pnpm -r preview` across workspace apps. 👀
- `lint` — `biome lint --write .` to apply lint fixes. 🧹
- `lint:fix` — `biome check --write .` (Biome’s check/fix mode across the repo). 🔧
- `test:node-env` — Prints Node path and version for debugging. 🧪

## Notes content pipeline (how notes get into the site) 🔗

1. `pnpm run notes:download` — Clone notes into `tmp-notes/`.
2. `pnpm run notes:migrate` — Copy Markdown and attachments into `apps/chiubaca.com`.
3. `pnpm run chiubaca.com:build` — Build site with the migrated content.
4. `pnpm run chiubaca.com:deploy` — Deploy to Cloudflare.

## Workspace 🧭

- Package manager: `pnpm@10.11.0` (declared in the root `package.json`).
- Workspace packages: `apps/*` (see `pnpm-workspace.yaml`). The `libs/` directory provides shared source and scripts, not standalone packages.
