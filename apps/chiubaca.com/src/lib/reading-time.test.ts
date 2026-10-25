import { describe, expect, it } from "vite-plus/test";
import { readingTimeMinutes } from "./reading-time";

describe("permanent note reading time", () => {
  it("gives empty and short notes a one-minute minimum", () => {
    expect(readingTimeMinutes("")).toBe(1);
    expect(readingTimeMinutes("A small thought.")).toBe(1);
  });

  it("rounds up at 220 readable words per minute", () => {
    expect(readingTimeMinutes("word ".repeat(220))).toBe(1);
    expect(readingTimeMinutes("word ".repeat(221))).toBe(2);
    expect(readingTimeMinutes("word ".repeat(661))).toBe(4);
  });

  it("counts link labels and formatted words without counting Markdown syntax or image paths", () => {
    const markdown = `${"word ".repeat(217)}[a link](https://example.com/${"path/".repeat(500)}) **some**thing ![](image.jpg)`;
    expect(readingTimeMinutes(markdown)).toBe(1);
  });

  it("includes fenced code, which still takes time to read", () => {
    expect(
      readingTimeMinutes(`A snippet:\n\n\`\`\`ts\n${"const example = true;\n".repeat(60)}\`\`\``),
    ).toBe(2);
  });

  it("ignores reference destinations and raw HTML", () => {
    expect(
      readingTimeMinutes(
        `${"word ".repeat(220)}\n\n[ref]: https://example.com\n\n<script>${"hidden ".repeat(500)}</script>`,
      ),
    ).toBe(1);
  });
});
