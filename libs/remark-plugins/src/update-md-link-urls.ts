import { defineMdastPlugin } from "satteri";

/**
 * Obsidian links from one md to another but in the website-
 * they're html files, therefore we need to remove any .md extensions
 * and also turn into html absolute paths.
 * e.g 'fleeting-notes/2022-01-01.md' converted to '/fleeting-notes/2022-01-01'
 */
export const updateMdLinkUrls = defineMdastPlugin({
  name: "update-md-link-urls",
  link(node, ctx) {
    if (!node.url || !node.url.endsWith(".md")) return;
    const newUrl = "/" + node.url.slice(0, -3);
    console.log(`MD mutation: Updated link url from ${node.url} to ${newUrl}`);
    ctx.setProperty(node, "url", newUrl);
  },
});
