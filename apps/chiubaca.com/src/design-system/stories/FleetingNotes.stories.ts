import type { Meta, StoryObj } from "../../../.storybook/types";
import FleetingNotesIndex from "../../components/journal/FleetingNotesIndex.astro";
import { noteFixtures, notesPagination } from "./note-fixtures";

const meta = {
  title: "Patterns/Fleeting notes",
  component: FleetingNotesIndex,
  args: { notes: noteFixtures, pagination: notesPagination },
  parameters: { controls: { disable: true }, amber: { fullPage: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Latest: Story = {};
export const Earlier: Story = {
  args: {
    pagination: {
      ...notesPagination,
      page: 2,
      start: 25,
      end: 27,
      newerHref: "/fleeting-notes/",
      olderHref: "/fleeting-notes/page/3/",
    },
  },
};
export const LastPage: Story = {
  args: {
    notes: [noteFixtures[2]],
    pagination: {
      ...notesPagination,
      page: 41,
      start: 961,
      end: 961,
      newerHref: "/fleeting-notes/page/40/",
      olderHref: null,
    },
  },
};
export const Empty: Story = {
  args: {
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
  },
};
