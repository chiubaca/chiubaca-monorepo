<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Project Structure

This is a pnpm workspace monorepo for all `*.chiubaca.com` sites.

## Workspace layout

- `apps/*` — deployable apps/packages
- `libs/*` — shared source and one-off scripts (not published packages)
- `tmp-notes/` — transient clone of the external notes repo

## Apps

| App                            | Stack              | Purpose                                                           |
| ------------------------------ | ------------------ | ----------------------------------------------------------------- |
| `apps/chiubaca.com`            | Astro + Cloudflare | Public website; consumes `fleeting-notes/` and `permanent-notes/` |
| `apps/notes.chiubaca.com`      | Cloudflare Worker  | Proxies `notes.chiubaca.com` to `chiubaca.com/fleeting-notes/`    |
| `apps/newsletter.chiubaca.com` | Astro + Cloudflare | Newsletter site                                                   |
| `apps/im.chiubaca.com`         | Vite               | Minimal `index.html` app                                          |

## Shared libraries

- `libs/remark-plugins/` — remark plugins used by `chiubaca.com` to rewrite Obsidian-style links and local image URLs
- `libs/scripts/` — helper scripts, including `migrate-notes.sh` for copying notes/attachments into `apps/chiubaca.com`

## Notes pipeline

1. `pnpm run notes:download` — clone notes into `tmp-notes/`
2. `pnpm run notes:migrate` — copy notes + attachments into `apps/chiubaca.com`
3. `pnpm run chiubaca.com:build` — build the site
4. `pnpm run chiubaca.com:deploy` — deploy to Cloudflare
