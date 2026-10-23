# Amber Journal Astro patterns

These modules are used by the development Amber homepage, the fleeting-note routes, and real Astro Storybook stories. Content is passed in; nothing here fetches `astro:content` or depends on the Cloudflare runtime.

## Shared layout

- `layouts/JournalLayout.astro` owns the document: metadata, canonical/adjacent links, a skip link, fonts, shared CSS, pre-paint appearance restoration, and the browser entry.
- `JournalShell.astro` owns the visible frame: wordmark, active navigation, a main-content slot, and the footer/appearance control. The Amber homepage and both notes patterns use it. `active` is `writing`, `notes`, or `memories`; `homeHref`/`writingHref` let the development homepage retain its prototype links.
- `AppearanceHead.astro` shares the pre-paint preference restore between the full journal document and the older three-variant prototype document.

Keeping the document and visible frame separate lets Storybook render the real page compositions without nesting `<html>` documents. Other routes can adopt the same layout without inheriting note-specific content loading or markup.

## Fleeting notes

`FleetingNotesIndex.astro` accepts plain `notes` and `pagination` props and groups summaries by publication month. It renders real links rather than client-only filtering: 24 notes per archive page, with `/fleeting-notes/` as page 1 and `/fleeting-notes/page/2/` onward. An empty archive has its own state.

`FleetingNotePage.astro` accepts one summary, optional `newer`/`older` summaries, its source-edit URL, and a default slot for the full rendered content. The existing `Content` module from `astro:content` fills the slot on real pages; Storybook supplies representative HTML. Markdown titles remain in the content, not copied into a second heading. Untitled historical notes get a date heading. An `archiveHref` links back to the appropriate archive page. Original note IDs/URLs and the individual pages' `noindex` policy are retained.

Pages own collection loading and `getStaticPaths`. `src/lib/fleeting-notes.ts` owns deterministic sorting, summary extraction, URL construction, and pagination. The summary parser uses pure-JavaScript `mdast-util-from-markdown` to keep extraction compatible with Cloudflare's page-render environment without bundling the native Sätteri compiler. It does not replace Sätteri's content renderer. Summary text is passed as escaped text, never inserted as HTML; the full rendered Markdown, images, code, and links remain unchanged.

The note styles live in `design-system/notes.css`: the archive date rail collapses on small screens; long links wrap; images scale; wide tables/code scroll locally. Tags link to the existing taxonomy page. Collection-only `fleeting`/`uncategorised` markers are not displayed as topics.

Storybook's **Fleeting note / Markdown / All formatting** story exercises a real `.md` source through the shared site processor, including H1–H6, code highlighting, task lists, tables, images, and footnotes. Code blocks keep their dark Dracula surface in both page modes, with corrected comment contrast. The Markdown task checkboxes remain read-only but have accessible names. See the design-system README for the specimen and asset details.

## PostSummary

```astro
<PostSummary
  title="Skill-stacking"
  href="/skill-stacking/"
  published="2026-01-07T00:00:00.000Z"
  category="Learning & making"
  summary="Learning new things by building something that connects them."
/>
```

`title`, `href`, and a valid ISO `published` date are required. Category and summary are optional and omitted from the markup when absent. `headingLevel` is `h3` by default, or `h2` when used directly under a page heading. Dates use UTC for consistent server output. Publication dates deliberately cross the story-render seam as strings: nested configured slots in the community renderer do not reliably revive Date objects in development.

## WritingSection

```astro
<WritingSection id="writing" title="Recent writing" archiveHref="/blogs/">
  {posts.map((post) => <PostSummary {...post} />)}
</WritingSection>
```

Give each section a unique `id`; it associates the section with its own heading. Omit `archiveHref` to remove the action. The default slot accepts any appropriate content, including an empty-state paragraph. Pages own collection loading, sorting, filtering, and adapting data to these interfaces.

## AppearanceSelect

Load the browser entry once in the page shell (already done in `JournalLayout.astro` and `HomepagePrototype.astro`):

```astro
<script>
  import "../components/journal/appearance";
</script>

<AppearanceSelect />
```

The default target is the document root and explicit choices persist under `amber-color-mode`. The page shell restores that key before first paint; this control then manages changes. System clears the saved override. Without the browser entry the control stays hidden and CSS follows the system preference.

For an independent, non-persistent demo, use `targetId="example"` and put the sample inside `<section id="example" class="amber-theme" data-theme="amber">`. Persistence defaults off for an isolated target and can also be set explicitly.

The custom element registers once, initializes new instances on story navigation, disconnects its observer/listeners on removal, and observes external root changes so the displayed selection stays in sync with Storybook's toolbar. Document-level selections emit `amber:color-mode-change`; the preview adapter uses that event to update Storybook globals. The shared entry is safe to import during server prerender.

## Code copy

`FleetingNotePage` wraps its Markdown slot in `<amber-code-copy>`. The browser entry `code-copy.ts` is loaded beside `appearance.ts` in `JournalLayout.astro` and the Storybook preview. It wraps each `pre` in `<amber-code>` and adds a small, roughly drawn copy icon in the block's top-right corner, faint until hovered or focused. It becomes a tick once copied, and a polite status announces the result. Without JavaScript or the async clipboard API, no button is added. The entry is safe to import during server prerender.

## Rough notation

The browser entry `notation.ts`, loaded beside `code-copy.ts`, redraws the hover marks with [rough-notation](https://roughnotation.com/): nav and footer links get a pen underline, prose links and `.amber-route` titles get a marker highlight, and footnote references get a short underline. It listens on the document, so no wrapper element is needed, and draws on hover or keyboard focus and clears when both have gone. The current nav page stays underlined twice without animating. Each mark keeps its shape for the life of the page, and reduced motion shows it without drawing in. The script sets `data-notation` on the root, and CSS turns off its own underlines and marker under that attribute, so without JavaScript the CSS versions stay. The swash, sparkle and arrow doodles are still `scribbles.ts` and CSS. The entry is safe to import during server prerender.

## Photo tape

`FleetingNotePage` also wraps its Markdown slot in `<amber-photo-tape>`. The browser entry `photo-tape.ts` gives each photo (a paragraph holding only an image) a random layout of tape (a strip, one piece, two corners, or all four), a random tilt, and a cross fold or a single fold, after aitchiss's taped paper pen. Without JavaScript, every photo keeps one strip of tape and a cross fold from CSS. The entry is safe to import during server prerender.

## Rough tables

`FleetingNotePage` also wraps its Markdown slot in `<amber-rough-tables>`. The browser entry `rough-table.ts`, loaded beside `code-copy.ts`, follows [h-kono-it/rough-table](https://github.com/h-kono-it/rough-table): it wraps each `table` in a scrolling `<amber-table>` and uses rough.js to sketch the grid behind it, one long pen stroke per grid line, with the header line gone over twice and the header hatched in. Table text is written in the same hand, `--amber-font-hand`. Each table has a fixed seed, so the wobble stays put when a `ResizeObserver` redraws it. Without JavaScript the plain CSS borders stay. The entry is safe to import during server prerender.

## Storybook pilot caveats

- Framework: `@storybook-astro/framework@1.12.0`, Storybook/builder 10.6.2. Foundation stories still return HTML/DOM. Astro stories use a component descriptor decorator, with no frozen mode attribute on the wrapper.
- Static Astro props and slots are fixed at build time. Use separate stories for variants. Browser CSS mode changes and the appearance controller still work without an Astro server.
- This release injects raw component CSS globally in Storybook rather than preserving full Astro scope isolation. All local selectors are therefore explicitly rooted in `amber-*` classes. Normal Astro pages still receive compiler-scoped styles. Check section headings and post headings together when changing styles.
- Native hoisted `<script>` URLs were left pointing at source `.astro?astro&type=script` paths in the static pilot. Loading `appearance.ts` from the document shell and the Storybook preview avoids that unsupported path without copying behaviour or rewriting build output. This does **not** establish that arbitrary Astro scripts work in static Storybook.
- The auto-loaded Alpine integration can emit an upstream “already initialized” warning. These patterns don't use Alpine; the pilot does not validate Alpine island behaviour.
- Do not import a full `<html>` layout into a fragment story. Test metadata, the pre-paint preference restore, and routing on the real Astro page.

`vp run storybook:build` followed by `vp run storybook:verify` checks the static artifact. Browser validation should cover both modes, small screens, editable development Controls, static appearance interaction, and navigation away from/back to the control.
