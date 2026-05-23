/**
 * Obsidian links from one md to another but in the website-
 * they're html files, therefore we need to remove any .md extensions
 * and also turn into html absolute paths .
 * e.g 'fleeting-notes/2022-01-01.md' converted to '/fleeting-notes/2022-01-01'
 */
interface MdastNode {
  type: string;
  url?: string;
  children?: MdastNode[];
}

export const updateMdLinkUrls = () => {
  return (tree: MdastNode) => {
    if (tree.children) {
      for (const child of tree.children) {
        if (child.type === "link") {
          if (!child.url || !child.url.endsWith(".md")) return;

          const originalUrl = child.url;
          const newUrl = "/" + originalUrl.replace(".md", "");
          child.url = newUrl;
          console.log(`MD mutation: Updated link url from ${originalUrl} to ${newUrl}`);
        }
        updateMdLinkUrls()(child);
      }
    }
  };
};
