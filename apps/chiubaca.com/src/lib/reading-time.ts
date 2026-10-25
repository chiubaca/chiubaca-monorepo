import { fromMarkdown } from "mdast-util-from-markdown";

interface ReadingNode {
  type: string;
  value?: string;
  children?: ReadingNode[];
}

function readableText(node: ReadingNode): string {
  if (["text", "inlineCode", "code"].includes(node.type)) return node.value ?? "";
  if (!node.children) return "";
  const inline = ["paragraph", "heading", "emphasis", "strong", "delete", "link", "linkReference"];
  return node.children.map(readableText).join(inline.includes(node.type) ? "" : "\n");
}

/** A server-side estimate at 220 words/minute, including code but not Markdown URLs. */
export function readingTimeMinutes(markdown: string): number {
  const words = readableText(fromMarkdown(markdown)).match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 220));
}
