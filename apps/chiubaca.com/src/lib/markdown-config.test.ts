import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import { createMarkdownOptions } from "./markdown-config";

const source = readFileSync(
  new URL("../design-system/stories/markdown-showcase.md", import.meta.url),
  "utf8",
);

async function render(source: string) {
  const options = createMarkdownOptions();
  const renderer = await options.processor.createRenderer(options);
  return renderer.render(source);
}

describe("the site's Markdown showcase", () => {
  it("renders all supported text families through the actual note pipeline", async () => {
    const { code } = await render(source);
    for (const tag of [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
      "del",
      "ul",
      "ol",
      "blockquote",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "img",
      "hr",
      "sup",
    ]) {
      expect(code).toMatch(new RegExp(`<${tag}(?:\\s|>)`));
    }
    expect(code).toContain('class="astro-code');
    expect(code).toContain('src="/attachments/markdown-notebook.jpg"');
    expect(code).toContain(
      'alt="A hiker with a backpack on a rocky mountain path beneath a cloudy sky."',
    );
    expect(code).toContain('type="checkbox"');
    expect(code).toContain('aria-label="Capture the idea."');
    expect(code).toContain('<table tabindex="0">');
    expect(code).toContain("data-footnote-backref");
    expect(code).not.toContain("__ASTRO_IMAGE_");
    expect(code).not.toContain("<script>");
    expect(code.toLowerCase()).not.toContain("color:#6272a4");
    expect(code).toContain('href="#footnote-label"');
  });

  it("names nested and loose task lists without including the nested task's text", async () => {
    const { code } = await render(
      "- [x] Parent task\n  - [ ] Child task\n\n- [ ] A **loose** task\n\n  More detail.",
    );
    expect(code).toContain('aria-label="Parent task"');
    expect(code).toContain('aria-label="Child task"');
    expect(code).toContain('aria-label="A loose task"');
  });

  it("uses independent heading anchors for separately rendered documents", async () => {
    const first = await render("# An experiment");
    const second = await render("# An experiment");
    for (const { code } of [first, second]) {
      expect(code).toContain('href="#an-experiment"');
      expect(code).toContain('tabindex="-1"');
      expect(code).not.toContain('href="#an-experiment-1"');
    }
  });
});
