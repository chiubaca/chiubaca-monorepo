import type { Meta, StoryObj } from "../../../.storybook/types";
import { typographyRoles, type TypographyRole } from "../catalog";
import { codeSample, content, markup, reviewPage, tokens } from "./review";

interface TypographyArgs {
  role: TypographyRole;
  text: string;
  italic: boolean;
  muted: boolean;
}

const meta = {
  title: "Foundations/Typography",
  parameters: { renderer: "html" },
  args: {
    role: "title",
    text: "Everything I’ve built with AI this year",
    italic: false,
    muted: false,
  },
  argTypes: {
    role: { control: "select", options: typographyRoles.map((role) => role.key) },
    text: { control: "text" },
    italic: { control: "boolean" },
    muted: { control: "boolean" },
  },
} satisfies Meta<TypographyArgs>;

export default meta;
type Story = StoryObj<TypographyArgs>;

export const TypeScale: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const page = reviewPage(
      "03 · Typography",
      "A scale for reading",
      "Newsreader carries the writing; DM Sans carries the interface. Resize the canvas to review the fluid title and reading sizes. All measurements below come from the CSS tokens, not a separate scale.",
    );
    for (const role of typographyRoles) {
      const row = markup(`
        <section class="ds-type-row">
          <div class="ds-type-details"><h2>${role.name}</h2><code>${role.size}</code><p>${role.use}</p></div>
          <div class="ds-type-sample"><p class="amber-type-${role.key}"></p><small></small></div>
        </section>
      `);
      row.querySelector(".ds-type-sample p")!.textContent = role.sample;
      row.querySelector("small")!.textContent =
        `${tokens.value(role.size)} / ${tokens.value(role.leading)} · ${tokens.value(role.font).split(",")[0].replaceAll('"', "")}`;
      content(page).append(row);
    }
    return page;
  },
};

export const ReadingSpecimen: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const page = reviewPage(
      "03 · Typography",
      "Reading specimen",
      "Long-form typography in context: a comfortable measure, real italics, restrained links, and a native monospace voice for code. The page-heading role belongs to articles, not a homepage hero.",
    );
    content(page).append(
      markup(`
      <article class="ds-reading">
        <header class="ds-reading-header">
          <p class="amber-eyebrow">Learning & making</p>
          <h2 class="amber-type-heading">Skill-stacking</h2>
          <time class="amber-type-caption" datetime="2026-01-07">7 Jan 2026 · Alex Chiu</time>
        </header>
        <div class="amber-prose">
          <p>I never learn one new concept in isolation. I usually absorb a concept at a high level and <em>bank it</em>. I then use a side project as an opportunity to open up this bank, see what concepts would be a good fit, and learn them together.</p>
          <p>This helps me understand how concepts link together rather than learning about them in isolation. A side project lets me feel out how they work and helps me reach that <strong>aha moment</strong> a little sooner.</p>
          <h3>Learning through making</h3>
          <p>The useful part is finding a real thing to build. That might be a tool for a colleague, a small game, or a way to preserve a family memory. <a href="https://chiubaca.com/skill-stacking/" target="_blank" rel="noreferrer">Read the original note</a>.</p>
          <ul><li>Start with a problem you can recognise.</li><li>Keep the first version small.</li><li>Leave enough room to enjoy the process.</li></ul>
          <blockquote><p>Go deep on anything that piques your interest.</p></blockquote>
          <p>The same principle applies to this theme: use a role such as <code>--amber-color-text</code> rather than repeating a colour value.</p>
          <pre><code>.article-title {
  color: var(--amber-color-text);
  font-family: var(--amber-font-editorial);
}</code></pre>
          <p class="amber-type-caption">Adapted text for a typography specimen, not a newly published article.</p>
        </div>
      </article>
    `),
    );
    return page;
  },
};

export const Playground: Story = {
  render: ({ role, text, italic, muted }) => {
    const definition = typographyRoles.find((item) => item.key === role)!;
    const page = reviewPage(
      "03 · Typography",
      "Type playground",
      "Use Storybook’s Controls to change the text, role, italic style, or emphasis. Use the viewport toolbar to check wrapping on a small phone, tablet, or desktop.",
    );
    const specimen = document.createElement("section");
    specimen.className = "ds-playground";
    const sample = document.createElement("p");
    sample.className = `amber-type-${role}`;
    sample.textContent = text;
    if (italic) sample.style.fontStyle = "italic";
    if (muted) sample.style.color = "var(--amber-color-text-muted)";
    specimen.append(sample);
    specimen.append(
      codeSample(
        `.amber-type-${role}\n\nfont-family: var(${definition.font});\nfont-size: var(${definition.size});\nline-height: var(${definition.leading});`,
      ),
    );
    content(page).append(specimen);
    return page;
  },
};
