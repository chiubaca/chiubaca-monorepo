import type { FleetingNoteSummary, NotesPagination } from "../../components/journal/types";

export const noteFixtures: FleetingNoteSummary[] = [
  {
    id: "2026-08-07",
    href: "/fleeting-notes/2026-08-07/",
    published: "2026-08-07T00:00:00.000Z",
    title: "The Boring Truth About Passive Income",
    hasTitle: true,
    excerpt:
      "A data visualisation that ranks 41 income streams by the metric side-hustle lists conveniently bury: dollars per hour of your time, with realistic median estimates rather than lucky-outlier stories.",
    tags: ["personal-finance", "data-visualisation"],
  },
  {
    id: "2026-08-05",
    href: "/fleeting-notes/2026-08-05/",
    published: "2026-08-05T00:00:00.000Z",
    title: "Self-hosted Durable Objects and Workers",
    hasTitle: true,
    excerpt:
      "Worth investigating as a way to run the Cloudflare programming model without being tied to Cloudflare’s platform.",
    tags: ["ai", "cloudflare", "durable-objects", "workers", "self-hosting"],
  },
  {
    id: "2026-07-31",
    href: "/fleeting-notes/2026-07-31/",
    published: "2026-07-31T00:00:00.000Z",
    title: "31 July 2026",
    hasTitle: false,
    excerpt:
      "A few things worth coming back to. Small discoveries are easier to remember when you write them down.",
    tags: ["learning"],
  },
];

export const notesPagination: NotesPagination = {
  page: 1,
  pageCount: 41,
  total: 961,
  start: 1,
  end: 3,
  newerHref: null,
  olderHref: "/fleeting-notes/page/2/",
};

export const noteBody = `<h1>The Boring Truth About Passive Income</h1>
<h2>06:42 UTC</h2>
<p><strong><a href="https://sheets.works/data-viz/passive-income">The Boring Truth About Passive Income</a></strong> — A data visualisation that ranks 41 income streams by the metric side-hustle lists conveniently bury: dollars per hour of <em>your</em> time, with realistic median estimates rather than lucky-outlier stories. Also: never pay a fee to access earnings or withdraw money — run it on a spreadsheet, not a vibe.</p>`;

export const richNoteBody = `<h1>Keeping a useful notebook</h1>
<p>Sometimes the most useful thing to write down is the thing you haven’t quite figured out yet.</p>
<h2>A small experiment</h2>
<p>Start with a question, keep a record of what you tried, and leave a link for your future self.</p>
<ul><li>A <a href="https://example.com/">reference worth keeping</a>.</li><li>A short example:<pre><code>const notebook = notes.filter(note =&gt; note.worthKeeping);
console.log(notebook.map(note =&gt; note.title).join("\\n"));</code></pre></li></ul>
<blockquote><p>Understanding comes a little at a time. Leave room for the next thought.</p></blockquote>
<h2>Things to compare</h2>
<table><thead><tr><th>Approach</th><th>What it’s good for</th></tr></thead><tbody><tr><td>A daily note</td><td>Capturing a thought while it’s fresh</td></tr><tr><td>A longer article</td><td>Connecting the dots when you’re ready</td></tr></tbody></table>
<p>A long reference should wrap, too: <a href="https://example.com/">https://example.com/notebook/a-very-long-reference-with-enough-detail-to-wrap-on-a-small-screen-without-moving-the-rest-of-the-page</a>.</p>`;
