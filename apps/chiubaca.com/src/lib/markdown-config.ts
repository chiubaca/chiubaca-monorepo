import { satteri } from "@astrojs/markdown-satteri";
import type { AstroMarkdownOptions } from "astro/markdown";
import { readFileSync } from "node:fs";
import {
  updateImageUrls,
  updateMdLinkUrls,
  autolinkHeadings,
  markdownAccessibility,
} from "../../../../libs/remark-plugins";
import { readTokens } from "../design-system/token-values";

// The site and the Storybook specimen use the same Markdown pipeline.
// Create fresh heading plugins so separate documents don't share slug counters.
export function createMarkdownOptions() {
  const tokens = readTokens(
    readFileSync(new URL("../design-system/tokens.css", import.meta.url), "utf8"),
  );
  const shikiConfig = {
    theme: "dracula",
    transformers: [
      {
        name: "amber-readable-dracula-comments",
        tokens(lines) {
          for (const line of lines) {
            for (const token of line) {
              // Dracula's original comment colour is only 3:1 on its code surface.
              if (token.color?.toLowerCase() === "#6272a4") {
                token.color = tokens.value("--amber-color-code-comment");
              }
            }
          }
        },
      },
    ],
  } satisfies NonNullable<AstroMarkdownOptions["shikiConfig"]>;
  return {
    processor: satteri({
      mdastPlugins: [updateMdLinkUrls, updateImageUrls],
      hastPlugins: [autolinkHeadings(), markdownAccessibility],
    }),
    shikiConfig,
  };
}
