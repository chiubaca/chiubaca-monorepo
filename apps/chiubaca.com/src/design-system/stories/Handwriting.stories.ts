import type { Meta, StoryObj } from "../../../.storybook/types";
import { scribbleSvg } from "../scribbles";
import { content, markup, reviewPage } from "./review";

const meta = {
  title: "Foundations/Handwriting",
  parameters: { renderer: "html", controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Reenie Beanie is the chosen face and is self-hosted in fonts.css. The other
// candidates load from Google Fonts in this story only, for the record.
const candidates = [
  {
    family: "Reenie Beanie",
    size: "1.625rem",
    note: "Chosen. Scratchy ballpoint scrawl: loose, quick, and honest. Self-hosted as --amber-font-hand.",
  },
  {
    family: "Waiting for the Sunrise",
    size: "1.375rem",
    note: "Thin, upright ballpoint with a bounce. A little tidier than Reenie Beanie, so it holds up smaller.",
  },
  {
    family: "Nothing You Could Do",
    size: "1.25rem",
    note: "Slanted, quick print, like a note written in a hurry. The most personal, the hardest to skim.",
  },
  {
    family: "Just Me Again Down Here",
    size: "1.75rem",
    note: "Tall, narrow, uneven print. Closest in spirit to Reenie Beanie but easier to read.",
  },
];

const fontsHref = `https://fonts.googleapis.com/css2?${candidates
  .filter(({ family }) => family !== "Reenie Beanie")
  .map(({ family }) => `family=${family.replaceAll(" ", "+")}`)
  .join("&")}&display=swap`;

function loadCandidates() {
  if (document.getElementById("amber-handwriting-candidates")) return;
  const link = document.createElement("link");
  link.id = "amber-handwriting-candidates";
  link.rel = "stylesheet";
  link.href = fontsHref;
  document.head.append(link);
}

export const EyebrowCandidates: Story = {
  render: () => {
    loadCandidates();
    const page = reviewPage(
      "06 · Handwriting",
      "Notes in the margin",
      "Reenie Beanie is the eyebrow and margin-note hand. The three scratchy ballpoint faces it was chosen over are kept here for comparison, each sized to a similar x-height. They are for a few words at a time, in sentence case, never body text. Each sits beside the real Newsreader titles and the doodled scribbles.",
    );
    const cards = candidates
      .map(
        ({ family, size, note }) => `
        <article class="ds-hand" style="--ds-hand:'${family}', var(--amber-font-interface);--ds-hand-size:${size}">
          <header><h3>${family}</h3><p>${note}</p></header>
          <div class="ds-hand-specimen">
            <p class="ds-hand-eyebrow">Learning &amp; making</p>
            <p class="ds-hand-title">Everything I’ve built with AI this year</p>
          </div>
          <div class="ds-hand-specimen">
            <p class="ds-hand-eyebrow">From the archive</p>
            <p class="ds-hand-title">4am Hugs</p>
          </div>
          <p class="ds-hand-note"><span class="amber-nudge" data-direction="west" aria-hidden="true">${scribbleSvg("arrow-west")}</span> start here, it’s a good one!</p>
        </article>`,
      )
      .join("");
    content(page).append(
      markup(`
      <section class="ds-section"><h2>Compare</h2><div class="ds-hand-grid">${cards}</div></section>
      <section class="ds-section"><h2>The previous eyebrow, for reference</h2>
        <p style="font-size:0.6875rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--amber-color-text-muted)">Learning &amp; making</p>
        <p class="ds-hand-title">Everything I’ve built with AI this year</p>
      </section>
    `),
    );
    return page;
  },
};
