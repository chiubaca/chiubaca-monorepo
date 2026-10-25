import type { Meta, StoryObj } from "../../../.storybook/types";
import PermanentNotePage from "../../components/journal/PermanentNotePage.astro";
import { richNoteBody } from "./note-fixtures";

const meta = {
  title: "Patterns/Permanent note",
  component: PermanentNotePage,
  args: {
    title: "Leaning into the vibes",
    description: "Reflections on embracing AI with a side project.",
    tags: ["ai", "musings"],
    published: "2026-01-07T00:00:00.000Z",
    updated: "2026-01-08T00:00:00.000Z",
    readingMinutes: 6,
    slots: { default: richNoteBody.replace(/^<h1>.*?<\/h1>/, "") },
  },
  parameters: { controls: { disable: true }, amber: { fullPage: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Article: Story = {};
export const LongTitle: Story = {
  args: {
    title: "Everything I’ve built with AI this year, and what I learned along the way",
    description:
      "Useful, playful things made in the small hours between parenting and everything else. A record of the experiments, the surprises, and the things I’d do differently.",
    tags: ["ai", "learning", "side-projects", "software-engineering"],
    readingMinutes: 14,
  },
};
export const WithoutBlurb: Story = {
  args: {
    title: "4am Hugs",
    description: null,
    tags: [],
    updated: "2026-01-07T00:00:00.000Z",
    readingMinutes: 1,
  },
};
export const Draft: Story = { args: { draft: true } };
