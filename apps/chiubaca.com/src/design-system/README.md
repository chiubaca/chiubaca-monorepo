# Amber Journal

The selected direction for chiubaca.com: calm, focused, minimal, and warm. The homepage has no promotional headline or illustrations. Personality comes from typography, colour, and the writing itself.

## Review in Storybook

From the workspace root:

```sh
vp run storybook
```

Open <http://localhost:6006>. The sidebar contains:

- **Overview** — the design decisions and font pairing.
- **Colour** — every semantic colour token, mode-aware contrast ratios, and a side-by-side light/dark specimen.
- **Typography** — the full role-based scale, a reading specimen, and an interactive text playground.
- **Rhythm** — spacing, reading measures, gutters, and interaction sizes.
- **Components** — real Astro `PostSummary`, slotted `WritingSection`, and interactive `AppearanceSelect` examples.
- **Journal** — the actual `AmberJournal.astro` composition with representative content, not copied HTML.
- **Fleeting notes / Fleeting note** — the real archive and individual-note compositions, including pagination, empty/untitled states, and a rich reading specimen.
- **Fleeting note / Markdown / All formatting** — a real Markdown specimen covering headings H1–H6, emphasis/strikethrough, inline and fenced/indented code, nested/ordered/task lists, blockquotes, tables, images, separators, links, and footnotes.

Foundations remain HTML reference stories and explicitly select `parameters.renderer: "html"` so DOM decorators use normal Storybook composition rather than Astro's server-render placeholder composition. Components and the Journal pattern render the same `.astro` files used by the development homepage, through `@storybook-astro/framework@1.12.0`. Use the viewport toolbar to review 320px, 390px, 768px, and 1440px canvases. The Accessibility panel checks the rendered stories.

In development, PostSummary's Controls edit real server-rendered props. In a static build, Astro props/slots are fixed and their Controls are disabled by the framework. The HTML typography playground, browser appearance control, and Light/Dark/System toolbar remain interactive in static output.

The **Light / Dark / System** toolbar changes every story and the Storybook interface together. System is the default and responds immediately when the operating system changes. Swatch hex values and contrast ratios update with the selected mode.

```sh
vp run storybook:build
vp run storybook:verify
vp test apps/chiubaca.com/.storybook apps/chiubaca.com/src/design-system apps/chiubaca.com/src/components/journal apps/chiubaca.com/src/lib
```

The build produces `apps/chiubaca.com/storybook-static/`; it is not part of the blog build or deployment and needs no render server. Storybook telemetry is disabled. The Astro preset reads the site's config for integrations/Vite plugins, but renders fragments through its own Container runtime, not the Cloudflare adapter. We retain `publicDir: false` after that merge so the blog's photos and attachments aren't copied. The only media fixture is `stories/assets/markdown-notebook.jpg`, served under `/attachments/` to exercise the site's image-URL rewriting. `storybook:verify` checks the prerendered Astro stories, required Markdown elements, the single-image media allowlist, and the existing page/slot/script checks.

### Tailnet previews

Use HTTPS for remote review so Storybook has the browser's native secure-context APIs. From the workspace root, build the static output and keep a loopback-only server running:

```sh
vp run storybook:build
python3 -m http.server 6010 --bind 127.0.0.1 --directory apps/chiubaca.com/storybook-static
```

In another terminal, inspect any existing Serve configuration before adding the dedicated Storybook endpoint:

```sh
tailscale serve status --json
tailscale serve --bg --https=8443 http://127.0.0.1:6010
```

Open the `https://<device>.<tailnet>.ts.net:8443/` URL printed by Tailscale. This stays inside the tailnet; do not use Funnel. Proxying the local server also avoids filesystem-access restrictions when the macOS Tailscale app serves a directory directly. To remove only this endpoint, use `tailscale serve --https=8443 off`; do not reset unrelated Serve configuration.

When verifying the endpoint, check `window.isSecureContext`, the native `crypto.randomUUID` function, and an actual Astro story in both the manager iframe and isolation view. A fresh HTTPS origin avoids old HTTP iframe caches as well as the original API restriction.

#### HTTP compatibility

Browsers expose `crypto.randomUUID()` on localhost and HTTPS, but not on an HTTP Tailscale IP. The Astro renderer calls it even for prerendered static stories. `.storybook/webcrypto-compatibility.js` runs as an early inline script in the manager and preview documents and supplies a UUID v4 implementation only when the native method is absent. It uses `crypto.getRandomValues()`, preserves native implementations, and never substitutes non-cryptographic randomness. Tests cover UUID bits, fresh entropy, native preservation, and repeat loading; the build verifier protects the early script placement.

This is isolated to Storybook: it is not imported by the blog and does not make an HTTP origin a secure context or enable other HTTPS-only APIs. Prefer HTTPS for a deployed Storybook. When checking a tailnet preview, load an actual Astro story and check for its rendered content—not just an HTTP 200 or a working HTML foundation story.

### Markdown specimen

`stories/markdown-showcase.md` is the editable source of the All formatting story; its HTML is not handwritten. `stories/FleetingNoteMarkdown.astro` renders it server-side through `createMarkdownOptions()` from `src/lib/markdown-config.ts`, the same processor configuration used by `astro.config.ts`. The Storybook framework excludes Astro's native `.md` import plugin, so this specimen calls the public processor API and passes its trusted output into the real note page's content slot. No Markdown compiler is shipped to the browser, and this story is not added to the published notes collection.

Highlighted code retains the existing Dracula surface in both page modes. `--amber-color-code-background`, `--amber-color-code-text`, and `--amber-color-code-comment` document that pairing in Colour stories and contrast tests. A Shiki transformer replaces Dracula's 3:1 comment colour with the readable comment token; other syntax colours remain unchanged. The shared Markdown pipeline also gives read-only task checkboxes names derived from their task text, and heading anchors respect existing IDs such as the generated footnote heading.

The image fixture is a 960px-long-edge, JPEG-quality-65 derivative of the existing `public/attachments/20230404_143210.jpg`. It is content used to test Markdown image rendering, not a new page illustration.

`tsconfig.browser.json` isolates the DOM-based story/controller code from the Worker's HTMLRewriter types. The app's explicit `type: module` lets the community preset load the existing ESM Astro config. The main preview optimizer has a separate cache from the preset's internal SSR server to avoid outdated dependency responses.

## Use the theme

```ts
import "./design-system/index.css";
```

Wrap the interface in `.amber-theme`. Use `.amber-type-title`, `.amber-type-body`, and the other documented type roles, or consume the variables directly. Use `.amber-prose` for long-form article content. All variables are prefixed with `--amber-` so they can coexist with the current blog styles during rollout.

### Colour mode

The semantic colours use CSS `light-dark()`, supported by current evergreen browsers. They follow the operating system by default, even without JavaScript. Typography and layout stay identical in both modes.

```html
<!-- An explicit page-level preference overrides the system. -->
<html data-color-mode="dark">
  <body class="amber-theme">
    …
  </body>
</html>

<!-- Theme islands can be reviewed independently. -->
<section class="amber-theme" data-theme="amber" data-color-mode="light">…</section>
```

Use `data-color-mode="light"`, `"dark"`, or `"system"` on the root. Remove the attribute to return to System. For independent theme islands, include `data-theme="amber"` as shown above.

The shared journal footer has an **Appearance** select on the Amber homepage preview and fleeting-note routes. Explicit choices persist in local storage and are restored before first paint; System clears the saved override. If storage is blocked, the current page still switches. Without JavaScript, the non-functional control is hidden and the CSS follows the system.

```css
.article-title {
  color: var(--amber-color-text);
  font-family: var(--amber-font-editorial);
  font-size: var(--amber-font-size-title);
  line-height: var(--amber-leading-title);
}
```

## Sources of truth

- `tokens.css` — palette, semantic colours, fonts, type sizes, line heights, spacing, measures, and focus/motion values.
- `fonts/fonts.css` — self-hosted Newsreader regular/italic and DM Sans. SIL Open Font Licenses are alongside the files.
- `typography.css` — shared type roles, accessible focus/selection styling, and article prose.
- `journal.css` — the shared journal shell styles.
- `notes.css` — archive summaries, pagination, note reading styles, and adjacent-note navigation.
- `../components/journal/` — Astro pattern markup, component-owned styles, and the shared appearance browser entry; see its README for usage and framework caveats.
- `catalog.ts` — descriptions and variable names only; never copied token values.
- `token-values.ts` — resolves CSS aliases and light/dark colour pairs for Storybook, including its manager theme, and calculates WCAG 2 contrast.
- `color-mode.ts` — validates preferences and resolves System without browser dependencies.

The light palette keeps warm paper, deep-green ink, and restrained ochre. The dark palette uses moss-charcoal surfaces, warm ivory, and honey accents rather than inverting the light colours. In both modes, all normal text roles meet 4.5:1 on every surface; selection text and text on the solid accent also meet AA. Focus rings and control boundaries meet 3:1 on every surface. The lighter original ochre is retained as a primitive for decorative use only. Hairline borders are decorative, not sufficient boundaries for form controls.

Type sizes and spacing use rem. Editorial titles and reading sizes use clamp. The journal date column stacks at 37.5rem; this breakpoint is a media query rather than a custom property, since CSS variables cannot be used in media-query conditions. Links respect reduced-motion preferences.

## Rollout status

The Amber homepage prototype consumes this system at `/?variant=amber` in development. Fleeting-note index/detail routes now use the shared journal layout in local and production builds. The original production homepage and other design studies remain unchanged. These changes have not been deployed.

Storybook 10.6.2 declares an optional Vite+ peer range ending at 0.2; this workspace uses 0.3.1. No workspace-wide peer override has been added. Validate Storybook's development server and static build against the installed Vite+ version when upgrading.
