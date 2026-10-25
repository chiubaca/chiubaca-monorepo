import type { Meta, StoryObj } from "../../../.storybook/types";
import FleetingNoteMarkdown from "./FleetingNoteMarkdown.astro";

export default {
  title: "Patterns/Fleeting note/Markdown",
  component: FleetingNoteMarkdown,
  parameters: { controls: { disable: true }, amber: { fullPage: true } },
} satisfies Meta;

export const AllFormatting: StoryObj = {};
