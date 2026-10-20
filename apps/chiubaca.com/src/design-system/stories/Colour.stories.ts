import type { Meta, StoryObj } from "../../../.storybook/types";
import { colourTokens } from "../catalog";
import { contrastRatio } from "../token-values";
import { colourSwatch, content, markup, reviewPage, modeTokens, storyColorMode } from "./review";

const meta = {
  title: "Foundations/Colour",
  parameters: { renderer: "html", controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SemanticTokens: Story = {
  render: (_, { globals }) => {
    const mode = storyColorMode(globals);
    const page = reviewPage(
      "02 · Colour",
      "Colour tokens",
      `Choose a colour by its job, not its hex value. Reviewing ${mode} mode: these swatches and the Storybook interface resolve their values directly from tokens.css. Switch Light, Dark, or System in the toolbar.`,
    );
    for (const group of ["Surfaces", "Text & accents", "Details", "Code"]) {
      const section = markup(
        `<section class="ds-section"><h2>${group}</h2><div class="ds-colour-grid"></div></section>`,
      );
      const grid = section.querySelector(".ds-colour-grid")!;
      for (const item of colourTokens.filter((token) => token.group === group)) {
        grid.append(colourSwatch(item.name, item.token, item.use, mode));
      }
      content(page).append(section);
    }
    content(page).append(
      markup(
        '<p class="ds-footnote">Use semantic tokens in components. Palette tokens are implementation details. Both modes keep normal text at AA on all three surfaces. The dark palette uses warm ivory and honey over moss-charcoal, not inverted light colours.</p>',
      ),
    );
    return page;
  },
};

export const Contrast: Story = {
  render: (_, { globals }) => {
    const mode = storyColorMode(globals);
    const tokens = modeTokens(mode);
    const page = reviewPage(
      "02 · Colour",
      "Contrast, checked",
      `Actual WCAG 2 contrast ratios for ${mode} mode, calculated from the current CSS. Normal text needs at least 4.5:1. Switch modes in the toolbar to compare. Fine decorative rules are not interactive boundaries.`,
    );
    const table = markup(`
      <section class="ds-section">
        <h2>Normal-size text on paper and code surfaces</h2>
        <div class="ds-table-wrap" role="region" aria-label="Colour contrast ratios" tabindex="0">
          <table class="ds-table"><thead><tr><th scope="col">Foreground</th><th scope="col">Background</th><th scope="col">Sample</th><th scope="col">Ratio / normal text</th></tr></thead><tbody></tbody></table>
        </div>
      </section>
    `);
    const rows = table.querySelector("tbody")!;
    for (const foreground of ["text", "text-muted", "accent"]) {
      for (const background of ["page", "surface", "surface-muted"]) {
        const frontToken = `--amber-color-${foreground}`;
        const backToken = `--amber-color-${background}`;
        const ratio = contrastRatio(tokens.value(frontToken), tokens.value(backToken));
        const row = document.createElement("tr");
        row.innerHTML = `<td>${foreground}</td><td>${background}</td><td><span class="ds-contrast-sample">Aa 0123</span></td><td>${ratio.toFixed(2)}:1 · ${ratio >= 4.5 ? "AA pass" : "Below AA"}</td>`;
        const sample = row.querySelector<HTMLElement>(".ds-contrast-sample")!;
        sample.style.color = `var(${frontToken})`;
        sample.style.backgroundColor = `var(${backToken})`;
        rows.append(row);
      }
    }
    for (const foreground of ["code-text", "code-comment"]) {
      const frontToken = `--amber-color-${foreground}`;
      const ratio = contrastRatio(
        tokens.value(frontToken),
        tokens.value("--amber-color-code-background"),
      );
      const row = document.createElement("tr");
      row.innerHTML = `<td>${foreground}</td><td>code-background</td><td><span class="ds-contrast-sample">// a small experiment</span></td><td>${ratio.toFixed(2)}:1 · ${ratio >= 4.5 ? "AA pass" : "Below AA"}</td>`;
      const sample = row.querySelector<HTMLElement>(".ds-contrast-sample")!;
      sample.style.color = `var(${frontToken})`;
      sample.style.backgroundColor = "var(--amber-color-code-background)";
      rows.append(row);
    }
    content(page).append(table);
    const selection = contrastRatio(
      tokens.value("--amber-color-selection-text"),
      tokens.value("--amber-color-selection"),
    );
    const focus = contrastRatio(
      tokens.value("--amber-color-focus"),
      tokens.value("--amber-color-page"),
    );
    content(page).append(
      markup(
        `<p class="ds-footnote">Selection text: ${selection.toFixed(2)}:1. Focus ring against paper: ${focus.toFixed(2)}:1 (minimum 3:1). Token tests protect these pairings when the palette changes.</p>`,
      ),
    );
    return page;
  },
};

export const LightAndDark: Story = {
  render: () => {
    const page = reviewPage(
      "02 · Colour",
      "One journal, two modes",
      "The same type, spacing, and semantic tokens in both modes. System follows your operating system; an explicit Light or Dark choice takes precedence.",
    );
    const comparison = markup(
      '<section class="ds-section ds-mode-comparison" aria-label="Light and dark comparison"></section>',
    );
    for (const mode of ["light", "dark"] as const) {
      const specimen = markup(`
        <article class="amber-theme ds-mode" data-theme="amber" data-color-mode="${mode}">
          <h2 class="amber-eyebrow">${mode} mode</h2>
          <p class="ds-mode-meta amber-type-caption">Learning & making · 7 Jan 2026</p>
          <h3 class="amber-type-title">Skill-stacking</h3>
          <p class="ds-mode-summary amber-type-summary">Learning new things by building something that connects them.</p>
          <p class="amber-type-reading">A quieter space for ideas, whether you’re reading over morning coffee or in the small hours.</p>
          <a href="https://chiubaca.com/skill-stacking/" target="_blank" rel="noreferrer">Read the note <span aria-hidden="true">↗</span></a>
        </article>
      `);
      comparison.querySelector(".ds-mode-comparison")!.append(specimen);
    }
    content(page).append(comparison);
    return page;
  },
};
