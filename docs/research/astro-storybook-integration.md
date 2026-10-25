# Astro + Storybook integration options

Research date: 2026-10-18. Scope: reuse real `.astro` modules for the Amber Journal design system without duplicating their HTML in Storybook.

## Recommendation

**Pilot follow-up:** The integration has now been tried in this workspace. See [`apps/chiubaca.com/src/components/journal/README.md`](../../apps/chiubaca.com/src/components/journal/README.md) for observed CSS/script/serialization limitations and the small host-level adaptations. The research below records the upstream evidence gathered before installation, not a guarantee of full feature parity.

Pilot **`@storybook-astro/framework@1.12.0`**, the community project at <https://storybook-astro.org/>, rather than writing our own Astro-to-Storybook rendering bridge. Its published package explicitly accepts Astro 7, Storybook 10, and Vite 8; its renderer supports Astro, HTML strings, and DOM nodes. This is a better fit than the similarly named unscoped package. Compatibility with this repo's Vite+ alias still needs an actual integration test; peer ranges and upstream examples are not proof of local compatibility. [1][2][3]

Use static Storybook builds initially. Accept fixed Astro prop variants in the published review site, while preserving browser-driven colour-mode switching. Do not adopt a separate render server just to make published prop Controls editable. [4][5]

Research only: no dependencies, configuration, production pages, or running servers were changed. Published package source was inspected in the approved temporary directory; the framework was not installed or run in this project.

## Local baseline

Verified from the current files and installed toolchain:

| Tool or constraint       | Current state                                                         |
| ------------------------ | --------------------------------------------------------------------- |
| Astro                    | Installed 7.0.7; catalog range `^7.0.7`                               |
| Storybook                | 10.6.2                                                                |
| Framework                | `@storybook/html-vite@10.6.2`                                         |
| Accessibility addon      | `@storybook/addon-a11y@10.6.2`                                        |
| Vite+                    | 0.3.1; workspace overrides `vite` with `@voidzero-dev/vite-plus-core` |
| Underlying Vite / Vitest | 8.2.2 / 4.1.11, reported by `vite-plus/versions`                      |
| Node                     | 24.22.0                                                               |
| Astro integrations       | Alpine; Tailwind via a Vite plugin; Cloudflare adapter                |
| Review stories           | Browser-generated HTML/DOM, shared CSS, Light/Dark/System globals     |
| Production constraint    | Keep the existing homepage unchanged until a separate rollout         |

Relevant files: `apps/chiubaca.com/package.json`, `pnpm-workspace.yaml`, `apps/chiubaca.com/astro.config.ts`, and `apps/chiubaca.com/.storybook/{main,preview}.ts`.

## Options compared

| Option                                                              | Evidence                                                                                                                                                                                                                      | Assessment for this repo                                                                                                                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`@storybook-astro/framework` 1.12.0**                             | Published 2026-09-10; peers include Astro `^5.5.3 \|\| ^6.0.0 \|\| ^7.0.0`, Storybook `^10.0.0`, Vite `^6.4.1 \|\| ^7.0.0 \|\| ^8.0.0`. [1]                                                                                   | **Best candidate.** Native Astro stories, slots, scoped CSS, static output, and testing helpers. Validate Vite+ and the existing preview setup.                    |
| **`storybook-astro` 0.2.1** — ThinkOodle                            | Published 2026-04-24; peers stop at Astro 6 and Vite 7, although Storybook 10 is accepted. Different maintainer/package from the linked site. [6][7]                                                                          | Not the first choice on Astro 7 / Vite 8. Do not confuse its install command with the scoped framework.                                                            |
| **Original `slawekkolodziej/storybook-astro` / `@astrostory/core`** | Its own README calls it experimental and not production-ready. The recommended project's README acknowledges it as the original implementation. The `@astrostory/core` registry endpoint returned 404 during research. [8][9] | Useful historical context, not the preferred dependency.                                                                                                           |
| **Astro Container API + our existing HTML Storybook**               | Astro's official experimental server-side rendering API supports component props and slots. The docs explicitly warn of breaking changes even in patch/minor releases. [10]                                                   | Viable fallback, but we would own CSS/script delivery, story indexing, fixtures, and renderer maintenance. The community framework already handles these concerns. |
| **Dedicated Astro preview pages**                                   | Ordinary Astro pages can compose the same `.astro` modules, with the real app runtime. [11]                                                                                                                                   | Best fallback for full document shells, content collections, and app behaviour; less convenient than Storybook for prop controls and a unified catalogue.          |

Storybook's own framework-support table does not list Astro, and its Astro-support request remains open. Treat the recommended integration as community-maintained, not an official `@storybook/*` framework. [12][13]

## What the recommended framework actually provides

- **Direct Astro imports.** Stories can use `component: PostSummary` where `PostSummary` is imported from `PostSummary.astro`. Development rendering uses Astro's Container API rather than executing Astro factories as browser components. [2][3]
- **Slots and composition.** `args.slots.default` and named slots accept HTML strings, imported Astro references, configured children (`{ component, props, slots }`), and arrays. Configured-child slots shipped in 1.8.0. A string containing `<PostSummary />` is not compiled as Astro. [14][15]
- **Scoped CSS.** The framework includes Astro 5–7 compatibility handling for style submodules and nested Astro modules; this is more than a generic `innerHTML` adapter. [2][16]
- **Browser scripts.** The published renderer reinserts rendered script tags and cache-busts external module URLs so setup reruns on story navigation. This is useful for `AppearanceSelect`, but repeated navigation/listener cleanup still needs browser testing. A Container-only test does not execute those scripts. [3][17]
- **Existing HTML references.** The published renderer explicitly accepts strings and DOM nodes from custom story render functions, so colour/type references do not inherently require a second Storybook. Their current decorator does need adapting. [3]
- **Documentation.** JSDoc/prop extraction shipped in 1.11.0. Generated Astro usage snippets and optional Storybook 10.6 Docgen Server support shipped in 1.12.0. These are released features, despite some roadmap entries still saying “unreleased.” [15]
- **Testing.** Portable stories cover server-rendered output. `@storybook/addon-vitest` support shipped in 1.11.0 for real browser interaction tests. The optional Vitest peer floor is 4.1.0, below our 4.1.11. [1][15][17]

The published framework and renderer are version-matched: framework 1.12.0 depends on renderer 1.12.0. Install the framework and the matching Storybook builder; a separate renderer install is not normally needed. No React/Vue integration is required for plain Astro modules. [1][2]

## Important limits for Amber Journal

### Development versus a published static Storybook

| Behaviour                                              | Development                           | Static review build                                  |
| ------------------------------------------------------ | ------------------------------------- | ---------------------------------------------------- |
| Change Astro props through Controls                    | Server rerenders the story            | Disabled; HTML uses build-time args                  |
| Change Astro slot content through Controls             | Server rerenders                      | Fixed at build time                                  |
| Run component browser scripts                          | Renderer supports script replay       | Built assets/scripts must be verified                |
| Change light/dark via CSS and a browser root attribute | Can work without changing Astro props | Can also work; must not depend on server rerendering |
| Change a mode baked into an Astro decorator's props    | Rerenders                             | Frozen at the build-time globals                     |

The static limitation is about **server-rendered prop changes**, not a blanket prohibition on client-side interaction. Keep mode switching in the browser and use CSS `light-dark()`; do not make a live static theme toggle depend on rerunning an Astro wrapper. Astro decorators execute during static prerender against initial globals. [3][4][18]

`renderMode: 'server'` exists for dynamic prop Controls after deployment, but the docs require full Node.js APIs and still describe deployment support as in progress. Do not assume compatibility with our Cloudflare Worker adapter. Static review assets are the simpler starting point. [5][19]

### Content and application runtime

The roadmap lists `astro:content`, middleware, actions, `astro:env`, server islands, and deployment adapters as unsupported or future work. Fetch/filter content in Astro pages and pass plain data into the journal modules and story fixtures. Use actual Astro preview pages for application-level checks. [19]

Use stories for fragments such as `PostSummary`, `WritingSection`, and `AppearanceSelect`. Verify `JournalLayout`'s full document shell, metadata, and pre-paint theme restoration through an actual Astro page rather than nesting an `<html>` document into the Storybook canvas. [3][11]

### Our current configuration is not a drop-in swap

1. **Browser-only preview initialization.** `preview.ts` calls `window.matchMedia` at module evaluation. Static Astro prerender loads project annotations under Node; its source catches preview-load errors and can continue without global decorators. Guard browser access so a successful build cannot silently lose our theme wrapper. [20]
2. **DOM-based global decorator.** It currently calls `story()` and appends the returned DOM node. Astro's decorator pipeline instead composes an unresolved story handle into an Astro wrapper descriptor or HTML tree. Use a renderer-aware decorator or separate per-kind decorators, rather than treating an Astro story as an already rendered DOM node. [18][21]
3. **Sanitization.** Plain string slots/decorators are sanitized by default; `data-*` attributes and some semantic wrapper tags may be stripped. Prefer an imported Astro wrapper for theme markup rather than disabling sanitization globally. [14][18]
4. **Configuration auto-loading.** Published source reads integrations/fonts/Vite plugins from `astro.config.*`, then creates an Astro Vite configuration with `configFile: false`. It does not simply run the complete site's Cloudflare adapter, but loading the config still imports its dependencies and automatically brings in Alpine/Tailwind. Verify isolation instead of assuming the current empty Storybook Vite config remains sufficient. [22][23]
5. **Vite+ alias.** Upstream declares standard Vite 8 support, not tested Vite+ support. Its preset detects Vite's major through a resolved package version, with the exported Vite version as fallback. Check the selected optimizer path under the workspace override; do not force peer ranges or downgrade Astro to hide a mismatch. [24]
6. **Static assets.** Preserve `publicDir: false` in the effective final configuration. Recheck that `storybook-static/` does not copy the blog's photos/attachments, and that self-hosted design-system fonts still load. This is a local acceptance criterion, not an upstream guarantee.
7. **Test isolation.** Upstream recommends a dedicated Storybook browser-test config: its addon replaces test includes, so merging it into the existing test config can silently omit non-story tests. Keep relative story globs. [17]

## Suggested pilot, not yet implemented

1. Pin `@storybook-astro/framework@1.12.0` and `@storybook/builder-vite@10.6.2` in the app; switch only the Storybook framework initially. Keep the matching renderer supplied transitively.
2. Retain the HTML colour/type stories through the renderer's DOM/string path. Adapt their type annotations and the global decorator without copying their values into another source.
3. Extract one real `PostSummary.astro` with a small plain-data interface. Add default, long-title, and missing-summary variants.
4. Add a slotted `WritingSection.astro` story and a scripted `AppearanceSelect.astro` story to cover the two harder capabilities.
5. In development, verify prop Controls, slots, scoped CSS, HMR, both modes, responsive widths, accessibility, and repeated story navigation.
6. Build and serve static output independently of Astro dev. Verify all fixed variants, scripts, fonts, no render-server requests, no copied photo directories, and working Light/Dark/System switching.
7. Adopt only after those checks pass. Replace duplicated `Journal.stories.ts` markup with real Astro composition; leave production homepage rollout separate.

## Evidence and version caveats

- npm `latest` was 1.12.0 for both scoped packages, published 2026-09-10. The npm manifest identifies source commit `dfb3d246435fbb613ba133f559275c6fa7283aa4`; implementation links below are pinned there rather than to moving `develop`. [1][25]
- The website landing banner still says “Astro 5 & 6”, but its requirements page and published peer ranges include Astro 7. The changelog dates Astro 7 support to 1.7.0. [1][15][16]
- Upstream's release-source Astro 7 integration example uses Astro **7.2.8**, Storybook **10.6.0**, and Vite **8.x**, not our exact Astro **7.0.7** / Storybook **10.6.2** / Vite+ combination. Its workflow contains Astro 7 builds/browser tests, but these are not a substitute for our pilot. [26][27]
- Current official Container docs also show `renderComponent()` with `?container`, added in Astro **7.3.5**. That helper is not available in our installed **7.0.7**; do not copy that newer example into a fallback without an intentional Astro upgrade. [10]

## Primary sources

1. [Published framework 1.12.0 manifest](https://registry.npmjs.org/@storybook-astro/framework/1.12.0); [registry release times](https://registry.npmjs.org/@storybook-astro%2Fframework).
2. [Project README](https://github.com/storybook-astro/storybook-astro/tree/dfb3d246435fbb613ba133f559275c6fa7283aa4); [requirements](https://storybook-astro.org/getting-started/requirements/).
3. [Published-release renderer implementation](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/packages/%40storybook-astro/renderer/src/render.tsx).
4. [Static builds and limitations](https://storybook-astro.org/how-it-works/static-builds/).
5. [Render-mode configuration](https://storybook-astro.org/reference/configuration/#rendermode).
6. [Unscoped package 0.2.1 manifest](https://registry.npmjs.org/storybook-astro/0.2.1); [release times](https://registry.npmjs.org/storybook-astro).
7. [ThinkOodle's README](https://github.com/ThinkOodle/storybook-astro/blob/master/README.md).
8. [Original implementation README](https://github.com/slawekkolodziej/storybook-astro/blob/main/README.md).
9. [Original package registry lookup](https://registry.npmjs.org/%40astrostory%2Fcore).
10. [Official Astro Container API reference](https://docs.astro.build/en/reference/container-reference/).
11. [Official Astro modules/components guide](https://docs.astro.build/en/basics/astro-components/).
12. [Official Storybook framework-support table](https://storybook.js.org/docs/configure/integration/frameworks).
13. [Storybook's Astro-support request](https://github.com/storybookjs/storybook/issues/18356).
14. [Slots and configured children](https://storybook-astro.org/writing-stories/slots/).
15. [Changelog](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/CHANGELOG.md).
16. [Astro version compatibility layers](https://storybook-astro.org/how-it-works/version-compatibility/).
17. [Portable stories and browser-test setup](https://storybook-astro.org/guides/testing/).
18. [Decorator composition and static-mode behaviour](https://storybook-astro.org/writing-stories/decorators/).
19. [Roadmap and unsupported Astro features](https://storybook-astro.org/guides/roadmap/).
20. [Static runtime / preview loading](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/packages/%40storybook-astro/framework/src/productionRenderRuntime.ts).
21. [Published decorator implementation](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/packages/%40storybook-astro/renderer/src/decorators.ts).
22. [User Astro config loading](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/packages/%40storybook-astro/framework/src/loadUserAstroConfig.ts).
23. [Astro Vite config merge and filtered plugins](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/packages/%40storybook-astro/framework/src/vitePluginAstro.ts).
24. [Framework preset / Vite version detection](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/packages/%40storybook-astro/framework/src/preset.ts).
25. [Published renderer 1.12.0 manifest](https://registry.npmjs.org/@storybook-astro/renderer/1.12.0).
26. [Release-source Astro 7 integration package](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/integration/astro7/package.json).
27. [Release-source build/browser-test workflow](https://github.com/storybook-astro/storybook-astro/blob/dfb3d246435fbb613ba133f559275c6fa7283aa4/.github/workflows/build.yml).
