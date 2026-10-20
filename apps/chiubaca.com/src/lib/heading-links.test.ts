import { expect, it } from "vite-plus/test";
import { markdownToHtml } from "satteri";
import { autolinkHeadings } from "../../../../libs/remark-plugins/src/autolink-headings";

it("keeps decorative, screen-reader-hidden heading anchors out of the tab order", () => {
  const result = markdownToHtml("# A small discovery", { hastPlugins: [autolinkHeadings()] });
  expect(result.html).toContain('aria-hidden="true"');
  expect(result.html).toContain('tabindex="-1"');
  expect(result.html).toContain('href="#a-small-discovery"');
});
