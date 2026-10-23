import type { Meta, StoryObj } from "../../../.storybook/types";
import { spacingTokens } from "../catalog";
import { content, markup, reviewPage, tokens } from "./review";

const meta = {
  title: "Foundations/Rhythm",
  parameters: { renderer: "html", controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SpacingAndMeasure: Story = {
  render: () => {
    const page = reviewPage(
      "04 · Rhythm",
      "Space to read",
      "A four-pixel spacing rhythm, rem-based measures, and a fluid page gutter. Layout changes at 37.5rem: post dates move below their titles instead of squeezing the text.",
    );
    const spacing = markup(
      '<section class="ds-section ds-spacing"><h2>Spacing tokens</h2></section>',
    );
    for (const token of spacingTokens) {
      const row = markup(
        `<div class="ds-spacing-row"><code>${token}</code><div><div class="ds-spacing-bar"></div></div><span>${tokens.value(token)}</span></div>`,
      );
      row.querySelector<HTMLElement>(".ds-spacing-bar")!.style.inlineSize = `var(${token})`;
      spacing.append(row);
    }
    content(page).append(spacing);
    content(page).append(
      markup(`
      <section class="ds-section"><h2>Measures & interaction</h2>
        <div class="ds-table-wrap" role="region" aria-label="Layout tokens" tabindex="0"><table class="ds-table"><thead><tr><th scope="col">CSS variable</th><th scope="col">Value</th><th scope="col">Use</th></tr></thead><tbody>
          <tr><td>--amber-measure-page</td><td>${tokens.value("--amber-measure-page")}</td><td>Maximum journal width, including the gutter.</td></tr>
          <tr><td>--amber-measure-reading</td><td>${tokens.value("--amber-measure-reading")}</td><td>Maximum long-form reading measure.</td></tr>
          <tr><td>--amber-gutter</td><td>${tokens.value("--amber-gutter")}</td><td>Fluid page padding, with a 20px minimum at the default root size.</td></tr>
          <tr><td>--amber-tap-target</td><td>${tokens.value("--amber-tap-target")}</td><td>Minimum navigation target height.</td></tr>
          <tr><td>--amber-duration</td><td>${tokens.value("--amber-duration")}</td><td>Link colour transitions; removed for reduced motion.</td></tr>
        </tbody></table></div>
        <div class="ds-measure"><p class="amber-eyebrow">A 65ch reading measure</p><p class="amber-type-reading" style="max-inline-size:var(--amber-measure-reading)">Enough space for a thought to unfold, without making the reader travel too far from one line to the next. The gutter becomes smaller on a phone; the type does not become tiny to compensate.</p></div>
      </section>
    `),
    );
    return page;
  },
};
