import type { PostSummaryProps } from "../../components/journal/types";
import type { VariantProps } from "../../components/homepage-prototype/types";

export const posts: PostSummaryProps[] = [
  {
    title: "Everything I’ve built with AI this year",
    href: "/everthing-ive-built-with-ai-this-year/",
    category: "Learning & making",
    summary:
      "Useful, playful things made in the small hours between parenting and everything else.",
    published: "2026-07-18T00:00:00.000Z",
  },
  {
    title: "Coding is dead, long live coding",
    href: "/coding-is-dead-long-live-coding/",
    category: "Making with technology",
    summary: "The tools are changing. Clear thinking and good engineering still matter.",
    published: "2026-02-05T00:00:00.000Z",
  },
  {
    title: "Skill-stacking",
    href: "/skill-stacking/",
    category: "Learning & making",
    summary: "Learning new things by building something that connects them.",
    published: "2026-01-07T00:00:00.000Z",
  },
];

const prototypePosts = posts.map((post) => ({
  title: post.title,
  href: post.href,
  category: post.category ?? "",
  description: post.summary ?? "",
  datetime: post.published,
  date: new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(post.published)),
  readingTime: 5,
}));

export const journalFixture: VariantProps = {
  posts: prototypePosts,
  featured: prototypePosts[0],
  personal: { ...prototypePosts[0], title: "4am Hugs", href: "/4am-hugs/" },
  note: { href: "/fleeting-notes/", date: "7 Aug 2026", tags: [] },
};
