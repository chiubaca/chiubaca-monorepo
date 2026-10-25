import type { Meta, StoryObj } from "../../../.storybook/types";
import FleetingNotePage from "../../components/journal/FleetingNotePage.astro";
import { noteBody, noteFixtures, richNoteBody } from "./note-fixtures";

const meta = {
  title: "Patterns/Fleeting note",
  component: FleetingNotePage,
  args: {
    note: noteFixtures[0],
    older: noteFixtures[1],
    sourceHref: "https://github.com/chiubaca/notes/edit/main/fleeting-notes/2026-08-07.md",
    slots: { default: noteBody },
  },
  parameters: { controls: { disable: true }, amber: { fullPage: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Latest: Story = {};
export const Earlier: Story = {
  args: { newer: noteFixtures[0], older: noteFixtures[2], archiveHref: "/fleeting-notes/page/2/" },
};
export const UntitledDay: Story = {
  args: {
    note: noteFixtures[2],
    newer: noteFixtures[1],
    older: null,
    slots: {
      default:
        "<p>A few things worth coming back to. Small discoveries are easier to remember when you write them down.</p><ul><li>A useful idea from something I read.</li><li>Something to try tomorrow.</li></ul>",
    },
  },
};
export const Reading: Story = {
  args: {
    note: { ...noteFixtures[0], title: "Keeping a useful notebook", tags: ["learning", "writing"] },
    slots: { default: richNoteBody },
  },
};
