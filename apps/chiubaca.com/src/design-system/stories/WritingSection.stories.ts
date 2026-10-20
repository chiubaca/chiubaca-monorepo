import type { Meta, StoryObj } from "../../../.storybook/types";
import WritingSection from "../../components/journal/WritingSection.astro";
import PostSummary from "../../components/journal/PostSummary.astro";
import type { PostSummaryProps, WritingSectionProps } from "../../components/journal/types";
import { posts } from "./fixtures";

type Args = WritingSectionProps & {
  slots: { default: string | { component: typeof PostSummary; props: PostSummaryProps }[] };
};

const meta = {
  title: "Components/WritingSection",
  component: WritingSection,
  args: {
    id: "writing",
    title: "Recent writing",
    archiveHref: "/blogs/",
    slots: { default: posts.map((post) => ({ component: PostSummary, props: { ...post } })) },
  },
  argTypes: { slots: { control: false } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const WithPosts: Story = {};

export const WithoutArchiveLink: Story = {
  args: { archiveHref: undefined },
};

export const Empty: Story = {
  args: { slots: { default: "<p>No writing published yet. Check back soon.</p>" } },
};
