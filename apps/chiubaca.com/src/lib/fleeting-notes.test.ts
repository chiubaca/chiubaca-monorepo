import { describe, expect, it } from "vite-plus/test";
import {
  NOTES_PER_PAGE,
  noteSourceHref,
  notesPageHref,
  paginateFleetingNotes,
  sortFleetingNotes,
  summariseFleetingNote,
} from "./fleeting-notes";

function note(id: string, body = "", tags?: string[]) {
  return { id, body, data: { publish_date: new Date(`${id}T00:00:00.000Z`), tags } };
}

describe("fleeting note summaries", () => {
  it("uses the original Markdown title and a plain-text excerpt, not source markup", () => {
    const summary = summariseFleetingNote(
      note(
        "2026-08-07",
        "# A **small** discovery\n\n## 06:42 UTC\n\nA [useful link](https://example.com) and `some code`.\n\n- One\n- Two",
      ),
    );
    expect(summary).toMatchObject({
      title: "A small discovery",
      hasTitle: true,
      excerpt: "A useful link and some code. One Two",
      href: "/fleeting-notes/2026-08-07/",
      published: "2026-08-07T00:00:00.000Z",
    });
  });

  it("falls back to an unambiguous UTC date for older untitled entries", () => {
    expect(summariseFleetingNote(note("2020-09-10", "- Starting a notebook.")).title).toBe(
      "10 September 2020",
    );
    expect(summariseFleetingNote(note("2020-09-10")).hasTitle).toBe(false);
  });

  it("deduplicates topics and omits collection markers without mutating tags", () => {
    const entry = note("2026-08-07", "", ["fleeting", "design", "design", "uncategorised", "life"]);
    expect(summariseFleetingNote(entry).tags).toEqual(["design", "life"]);
    expect(entry.data.tags).toHaveLength(5);
    expect(summariseFleetingNote(note("2026-08-07")).tags).toEqual([]);
  });

  it("doesn't leak image paths, raw HTML, or code blocks into excerpts", () => {
    const summary = summariseFleetingNote(
      note(
        "2026-08-07",
        "![](photo.jpg)\n\n<script>secret()</script>\n\n```js\nsecret()\n```\n\nRead [[permanent/cloudflare-workers|Workers]] and [[learning/astro]].",
      ),
    );
    expect(summary.excerpt).toBe("Read Workers and astro.");
  });

  it("bounds long excerpts at a word boundary", () => {
    const summary = summariseFleetingNote(note("2026-08-07", "A small discovery. ".repeat(40)));
    expect(summary.excerpt.length).toBeLessThanOrEqual(220);
    expect(summary.excerpt.endsWith("…")).toBe(true);
    expect(summary.excerpt).not.toContain("\n");
  });
});

describe("archive navigation", () => {
  it("sorts newest-first without changing the collection", () => {
    const entries = [note("2020-09-10"), note("2026-08-07"), note("2026-08-05")];
    expect(sortFleetingNotes(entries).map((entry) => entry.id)).toEqual([
      "2026-08-07",
      "2026-08-05",
      "2020-09-10",
    ]);
    expect(entries[0].id).toBe("2020-09-10");
  });

  it("covers first, middle, and last pages with stable, crawlable links", () => {
    const entries = Array.from({ length: NOTES_PER_PAGE * 2 + 1 }, (_, index) => index);
    const first = paginateFleetingNotes(entries);
    const middle = paginateFleetingNotes(entries, 2);
    const last = paginateFleetingNotes(entries, 3);
    expect(first.pagination).toMatchObject({
      page: 1,
      start: 1,
      end: 24,
      pageCount: 3,
      newerHref: null,
      olderHref: "/fleeting-notes/page/2/",
    });
    expect(middle.pagination).toMatchObject({
      start: 25,
      end: 48,
      newerHref: "/fleeting-notes/",
      olderHref: "/fleeting-notes/page/3/",
    });
    expect(last.pagination).toMatchObject({
      start: 49,
      end: 49,
      newerHref: "/fleeting-notes/page/2/",
      olderHref: null,
    });
    expect([...first.notes, ...middle.notes, ...last.notes]).toEqual(entries);
  });

  it("supports an empty archive and rejects out-of-range pages", () => {
    expect(paginateFleetingNotes([])).toMatchObject({
      notes: [],
      pagination: {
        page: 1,
        pageCount: 1,
        total: 0,
        start: 0,
        end: 0,
        newerHref: null,
        olderHref: null,
      },
    });
    for (const page of [0, -1, 1.5, 2, NaN])
      expect(() => paginateFleetingNotes([], page)).toThrow(RangeError);
    expect(notesPageHref(1)).toBe("/fleeting-notes/");
  });

  it("points editing links at the current source repository", () => {
    expect(noteSourceHref("2026-08-07")).toBe(
      "https://github.com/chiubaca/notes/edit/main/fleeting-notes/2026-08-07.md",
    );
  });
});
