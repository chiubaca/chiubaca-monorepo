import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const output = new URL("../storybook-static/", import.meta.url);
for (const page of ["index.html", "iframe.html"]) {
  const html = readFileSync(new URL(page, output), "utf8");
  const bootstrapStart = html.indexOf('<script id="storybook-webcrypto-compat">');
  assert.ok(
    bootstrapStart >= 0 && bootstrapStart < html.indexOf("</head>"),
    `Missing early Web Crypto bootstrap: ${page}`,
  );
  for (const script of html.slice(0, bootstrapStart).matchAll(/<script\b([^>]*\bsrc=[^>]*)>/g)) {
    assert.match(
      script[1],
      /\btype=["']module["']|\bdefer\b/,
      `A blocking bundle runs before the Web Crypto bootstrap: ${page}`,
    );
  }
}
const index = JSON.parse(readFileSync(new URL("index.json", output), "utf8")) as {
  entries: Record<string, { type: string; componentPath?: string }>;
};
const stories = JSON.parse(
  readFileSync(new URL("astro-prerendered-stories.json", output), "utf8"),
) as Record<string, string>;

const astroIds = Object.entries(index.entries)
  .filter(([, entry]) => entry.type === "story" && entry.componentPath?.endsWith(".astro"))
  .map(([id]) => id);

for (const id of [
  "components-appearanceselect--interactive",
  "components-postsummary--default",
  "components-writingsection--with-posts",
  "patterns-journal--journal-index",
  "patterns-fleeting-notes--latest",
  "patterns-fleeting-notes--earlier",
  "patterns-fleeting-notes--last-page",
  "patterns-fleeting-notes--empty",
  "patterns-fleeting-note--latest",
  "patterns-fleeting-note--earlier",
  "patterns-fleeting-note--untitled-day",
  "patterns-fleeting-note--reading",
  "patterns-fleeting-note-markdown--all-formatting",
  "patterns-permanent-note--article",
  "patterns-permanent-note--long-title",
  "patterns-permanent-note--without-blurb",
  "patterns-permanent-note--draft",
])
  assert.ok(astroIds.includes(id), `Missing indexed Astro story: ${id}`);
for (const id of astroIds) {
  const html = stories[id];
  assert.ok(html, `Missing prerendered story: ${id}`);
  assert.ok(html.includes("amber-review"), `Missing theme wrapper: ${id}`);
  assert.ok(!html.includes("Error rendering Astro component"), `Render failed: ${id}`);
  assert.ok(
    !/src=["'][^"']*(?:\/@fs\/|\/Users\/|\?astro&)/.test(html),
    `Dev-only script URL: ${id}`,
  );
}

const withPosts = stories["components-writingsection--with-posts"];
assert.equal(
  (withPosts.match(/<article\b/g) ?? []).length,
  3,
  "Slot should render three real posts",
);
assert.ok(withPosts.includes('aria-labelledby="writing-heading"'));
assert.ok(withPosts.includes('datetime="2026-07-18T00:00:00.000Z"'), "Date props must survive SSR");
assert.ok(!stories["components-postsummary--without-summary"].includes("amber-post-description"));
assert.ok(!stories["components-writingsection--without-archive-link"].includes('href="/blogs/"'));
assert.ok(stories["components-writingsection--empty"].includes("No writing published yet"));
assert.equal(
  (stories["patterns-fleeting-notes--latest"].match(/class="amber-note-summary"/g) ?? []).length,
  3,
);
assert.ok(stories["patterns-fleeting-note--latest"].includes('aria-label="Adjacent notes"'));
assert.ok(stories["patterns-fleeting-notes--empty"].includes("The notebook is quiet"));

const permanentNote = stories["patterns-permanent-note--article"];
assert.equal(
  (permanentNote.match(/<h1\b/g) ?? []).length,
  1,
  "An article should have one page title",
);
assert.ok(permanentNote.includes('aria-labelledby="permanent-note-title"'));
assert.ok(
  permanentNote.includes('class="amber-article-hero-content"'),
  "Hero copy needs its own quiet background above the doodles",
);
assert.ok(permanentNote.includes("Reflections on embracing AI with a side project."));
assert.ok(permanentNote.includes("6 min read"));
assert.ok(permanentNote.includes('datetime="2026-01-07T00:00:00.000Z"'));
assert.ok(permanentNote.includes('href="/tags#ai"'));
assert.match(
  permanentNote,
  /<div[^>]+class="amber-journal-art"[^>]+aria-hidden="true"/,
  "Hero art should be decorative",
);
const heroArt = permanentNote.match(/<div class="amber-journal-art"[\s\S]*?<\/div>/)?.[0] ?? "";
assert.ok(
  heroArt.includes('vector-effect="non-scaling-stroke"'),
  "Cover scribbles should keep their pen weight at every viewport",
);
assert.ok(
  !/<(?:circle|rect|polygon)\b/.test(heroArt),
  "The cover should use generated rough.js paths, not geometric cut-outs",
);
for (const kind of ["star", "scribble", "squiggle"]) {
  assert.ok(heroArt.includes(`data-doodle="${kind}"`), `Missing rough.js hero motif: ${kind}`);
}
assert.ok(
  !heroArt.includes('data-doodle="smiley"'),
  "Hero artwork should not contain smiley faces",
);
assert.ok(heroArt.includes("--doodle-draw-delay:"), "Hero doodles need staggered drawing delays");
assert.equal(
  (heroArt.match(/<path\b/g) ?? []).length,
  13,
  "Each doodle should draw as one continuous path",
);
assert.ok(heroArt.includes('pathLength="1"'), "Rough.js paths need normalized lengths for drawing");
assert.ok(permanentNote.includes("A small experiment"), "The article body slot should survive SSR");
assert.ok(permanentNote.includes("Last updated"));
assert.ok(stories["patterns-permanent-note--long-title"].includes("software-engineering"));
assert.ok(stories["patterns-permanent-note--draft"].includes("Draft · permanent note"));
const minimalArticle = stories["patterns-permanent-note--without-blurb"];
assert.ok(!minimalArticle.includes("amber-article-blurb"));
assert.ok(!minimalArticle.includes('aria-label="Topics"'));
assert.ok(!minimalArticle.includes("Last updated"));

assert.ok(!existsSync(new URL("photos", output)), "Unexpected blog photos copied");
assert.deepEqual(
  readdirSync(new URL("attachments", output)),
  ["markdown-notebook.jpg"],
  "Only the small Markdown image fixture should be copied, not the blog attachments",
);

const markdown = stories["patterns-fleeting-note-markdown--all-formatting"];
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
  "img",
  "hr",
  "sup",
]) {
  assert.match(markdown, new RegExp(`<${tag}(?:\\s|>)`), `Missing Markdown element: ${tag}`);
}
assert.ok(
  markdown.includes('class="astro-code'),
  "Code examples should use the site's syntax highlighter",
);
assert.ok(
  markdown.includes("/attachments/markdown-notebook.jpg"),
  "The image must use the site's Markdown URL rewriting",
);
assert.ok(markdown.includes('type="checkbox"'), "Missing rendered Markdown task list");
assert.ok(markdown.includes('<table tabindex="0">'), "Markdown tables must be keyboard-scrollable");
assert.ok(markdown.includes("data-footnote-backref"), "Missing footnote return links");

console.log(
  `Verified ${astroIds.length} Astro stories: wrappers, slots, dates, optional content, and portable output.`,
);
