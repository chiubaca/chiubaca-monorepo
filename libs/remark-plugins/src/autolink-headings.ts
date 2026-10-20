import Slugger from "github-slugger";
import { defineHastPlugin } from "satteri";

/**
 * Append an anchor link `<a class="anchor" href="#slug">#</a>` to each heading.
 * Factory form so the slugger (with its dedup counter) resets per document.
 * Replaces rehype-slug + rehype-autolink-headings under Sätteri.
 */
export const autolinkHeadings = () => {
  const slugger = new Slugger();
  return defineHastPlugin({
    name: "autolink-headings",
    element: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      visit(node, ctx) {
        const existingId = node.properties.id;
        const slug =
          typeof existingId === "string" ? existingId : slugger.slug(ctx.textContent(node));
        ctx.appendChild(node, {
          type: "element",
          tagName: "a",
          properties: { href: `#${slug}`, className: ["anchor"], ariaHidden: "true", tabIndex: -1 },
          children: [{ type: "text", value: "#" }],
        });
      },
    },
  });
};
