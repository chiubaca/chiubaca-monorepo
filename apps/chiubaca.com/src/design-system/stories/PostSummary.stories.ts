import type { Meta, StoryObj } from "../../../.storybook/types";
import PostSummary from "../../components/journal/PostSummary.astro";
import type { PostSummaryProps } from "../../components/journal/types";
import { posts } from "./fixtures";

const meta = {
  title: "Components/PostSummary",
  component: PostSummary,
  args: { ...posts[0], headingLevel: "h2" },
  argTypes: {
    title: { control: "text" },
    href: { control: "text" },
    summary: { control: "text" },
    category: { control: "text" },
    published: { control: false },
    headingLevel: { control: "select", options: ["h2", "h3"] },
  },
} satisfies Meta<PostSummaryProps>;

export default meta;
type Story = StoryObj<PostSummaryProps>;

export const Default: Story = {};

export const LongTitle: Story = {
  args: {
    title:
      "Finding connections between the things we build, the things we learn, and the lives we make around them",
    summary:
      "A longer title should wrap naturally, without squeezing the date or losing its reading rhythm.",
  },
};

export const WithoutSummary: Story = {
  args: { ...posts[2], summary: undefined },
};

export const TitleAndDate: Story = {
  args: { ...posts[2], category: undefined, summary: undefined },
};
