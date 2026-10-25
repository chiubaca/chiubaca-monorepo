import type { Meta, StoryObj } from "../../../.storybook/types";
import { scribbleSvg } from "../scribbles";
import { content, markup, reviewPage, tokens } from "./review";

const meta = {
  title: "Foundations/Motion",
  parameters: { renderer: "html", controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const motionTokens = [
  ["--amber-duration-quick", "Presses: a control gives a little under the pointer."],
  ["--amber-duration-scribble", "One pen stroke of a scribble; later strokes wait this long."],
  ["--amber-duration-draw", "The marker swipe, arrow nudges, and focus."],
  ["--amber-duration-sunset", "The colour-mode wipe from the Appearance control."],
  ["--amber-duration-doodle", "The time to draw a rough.js article-cover doodle."],
  ["--amber-ease-out", "Arrives quickly, settles gently. Lines and presses."],
  ["--amber-ease-spring", "A small overshoot. Arrows and focus rings that spring into place."],
  ["--amber-press-scale", "How far a pressed control squishes."],
  ["--amber-nudge", "How far an arrow leans the way it points."],
];

export const PlayfulMotion: Story = {
  render: () => {
    const page = reviewPage(
      "05 · Motion",
      "A little bit dorky",
      "The writing stays calm, but the parts you touch reply like the margin of a scrapbook: pen scribbles, marker strokes, and doodled arrows that draw themselves in. Hover, focus, or press anything below.",
    );
    content(page).append(
      markup(`
      <section class="ds-section"><h2>The rules of play</h2><dl class="ds-principles">
        <div><dt>Interaction first</dt><dd>Interface motion answers a hover, a focus, or a press. Article-cover doodles draw themselves in once, like pen on paper, then stay still. The writing never moves.</dd></div>
        <div><dt>Earnest, not ironic</dt><dd>Small, warm gestures with real meaning: you are here, this goes there, that worked. No jokes at the reader's expense.</dd></div>
        <div><dt>Still works when still</dt><dd>With reduced motion, every end state remains: the underlines, the marker, the arrows, the new colours. Only the movement goes.</dd></div>
      </dl></section>

      <section class="ds-section"><h2>Navigation</h2>
        <header class="amber-header" style="padding-block:var(--amber-space-4)">
          <a class="amber-wordmark" href="#motion">chiubaca<span class="amber-wordmark-dot">.</span>${scribbleSvg("swash")}</a>
          <nav aria-label="Motion specimen navigation">
            <a href="#motion" aria-current="page">Writing${scribbleSvg("underline")}</a>
            <a href="#motion">Notes${scribbleSvg("underline")}</a>
            <a href="#motion">Memories${scribbleSvg("underline")}</a>
          </nav>
        </header>
        <dl class="ds-principles" style="margin-block-start:var(--amber-space-6)">
          <div><dt>The signature</dt><dd>Hover the wordmark. A swash signs itself underneath, loop and all.</dd></div>
          <div><dt>You are here</dt><dd>The current page is underlined twice in pen. Hovering another page, or a footer link, draws a single underline.</dd></div>
          <div><dt>A chonky press</dt><dd>Links that behave like buttons give a little when pushed, then spring back.</dd></div>
        </dl>
      </section>

      <section class="ds-section"><h2>Links that go somewhere</h2>
        <ul class="amber-note-tags" aria-label="Motion specimen tags" style="margin-block-end:var(--amber-space-4)">
          <li><a href="#motion"><span class="amber-tag-ink">personal-finance</span>${scribbleSvg("sparkle")}</a></li>
          <li><a href="#motion"><span class="amber-tag-ink">data-visualisation</span>${scribbleSvg("sparkle")}</a></li>
        </ul>
        <article class="amber-post amber-post-uncategorised" style="display:block;border:0;padding:0">
          <h3 style="font-size:var(--amber-font-size-title)"><a href="#motion" style="text-decoration:none"><span class="amber-route">Building a planning poker app on a chonk scale</span></a></h3>
        </article>
        <nav class="amber-notes-pagination" aria-label="Motion specimen pagination" style="margin-block-start:var(--amber-space-6)">
          <p>Tags come highlighted and sparkle on hover. A scrapbook marker swipes behind titles. Doodled arrows redraw themselves and lean the way they point.</p>
          <div>
            <a href="#motion" rel="prev"><span class="amber-nudge" data-direction="west" aria-hidden="true">${scribbleSvg("arrow-west")}</span> Newer notes</a>
            <a href="#motion" rel="next">Older notes <span class="amber-nudge" data-direction="east" aria-hidden="true">${scribbleSvg("arrow-east")}</span></a>
            <a href="#motion">The archive <span class="amber-nudge" data-direction="north-east" aria-hidden="true">${scribbleSvg("arrow-north-east")}</span></a>
          </div>
        </nav>
      </section>

      <section class="ds-section"><h2>Sunrise and sunset</h2>
        <p class="ds-footnote">Changing the footer's Appearance control on a real page spreads the new colours out from the control in a circle, using the View Transitions API. Browsers without it, theme islands, and reduced motion switch instantly. Use the Light/Dark toolbar here, or try the control on Patterns / Journal.</p>
      </section>
    `),
    );

    const rows = motionTokens
      .map(
        ([token, use]) =>
          `<tr><td>${token}</td><td>${tokens.value(token)}</td><td>${use}</td></tr>`,
      )
      .join("");
    content(page).append(
      markup(`
      <section class="ds-section"><h2>Motion tokens</h2>
        <div class="ds-table-wrap" role="region" aria-label="Motion tokens" tabindex="0"><table class="ds-table"><thead><tr><th scope="col">CSS variable</th><th scope="col">Value</th><th scope="col">Use</th></tr></thead><tbody>${rows}</tbody></table></div>
      </section>
    `),
    );
    return page;
  },
};
