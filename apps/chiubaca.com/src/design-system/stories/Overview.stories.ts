import type { Meta, StoryObj } from "../../../.storybook/types";
import { colourSwatch, codeSample, content, markup, reviewPage, storyColorMode } from "./review";

const meta = {
  title: "Foundations/Overview",
  parameters: { renderer: "html", controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AmberJournal: Story = {
  render: (_, { globals }) => {
    const mode = storyColorMode(globals);
    const page = reviewPage(
      "01 · Overview",
      "Amber Journal",
      "A reading-first design system for Alex Chiu’s blog. Warm paper by day, moss-charcoal after dark, and just enough amber. No homepage headline. No illustrations.",
    );
    const body = content(page);
    body.append(
      markup(`
      <section class="ds-section">
        <h2>Three voices, one journal</h2>
        <div class="ds-font-pair">
          <article><p class="amber-eyebrow">Editorial / serif</p><h3 class="ds-font-name">Newsreader</h3><p>Article titles, long-form reading, and the occasional italic aside. Regular weight, with room to breathe.</p></article>
          <article><p class="amber-eyebrow">Interface / sans</p><h3 class="ds-font-name">DM Sans</h3><p>Navigation, summaries, and metadata. A quieter supporting voice, never competing with the writing.</p></article>
          <article><p class="amber-eyebrow">Margin notes / hand</p><h3 class="ds-font-name">Reenie Beanie</h3><p>Eyebrows and scribbled asides, in sentence case. A ballpoint in the margin, a few words at a time.</p></article>
        </div>
      </section>
    `),
    );
    const colours = markup(
      '<section class="ds-section"><h2>The essential palette</h2><div class="ds-colour-grid"></div></section>',
    );
    const grid = colours.querySelector(".ds-colour-grid")!;
    grid.append(
      colourSwatch(
        "Paper",
        "--amber-color-page",
        "A warm canvas, never stark white or black.",
        mode,
      ),
      colourSwatch("Ink", "--amber-color-text", "Deep green by day; warm ivory after dark.", mode),
      colourSwatch("Amber", "--amber-color-accent", "A restrained, readable accent.", mode),
      colourSwatch(
        "Quiet ink",
        "--amber-color-text-muted",
        "Secondary text that stays legible.",
        mode,
      ),
    );
    body.append(colours);
    body.append(
      markup(`
      <section class="ds-section"><h2>The decisions behind it</h2><dl class="ds-principles">
        <div><dt>Let the writing lead</dt><dd>A short introduction, then the posts. No oversized promise before the reader can begin.</dd></div>
        <div><dt>Use less, deliberately</dt><dd>Colour establishes warmth. Fine rules establish rhythm. Neither needs to become decoration.</dd></div>
        <div><dt>Make space at every size</dt><dd>Fluid editorial type, readable measures, 44px navigation targets, and dates that stack on mobile.</dd></div>
      </dl></section>
    `),
    );
    const usage = markup(
      '<section class="ds-section"><h2>Use the same foundations everywhere</h2></section>',
    );
    usage.append(
      codeSample(
        'import "./design-system/index.css";\n\n/* Within .amber-theme */\n.article-title {\n  font-family: var(--amber-font-editorial);\n  font-size: var(--amber-font-size-title);\n  color: var(--amber-color-text);\n}',
      ),
    );
    body.append(usage);
    return page;
  },
};
