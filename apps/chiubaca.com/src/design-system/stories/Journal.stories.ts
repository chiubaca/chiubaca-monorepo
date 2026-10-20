import type { Meta, StoryObj } from "../../../.storybook/types";
import type { VariantProps } from "../../components/homepage-prototype/types";
import AmberJournal from "../../components/homepage-prototype/AmberJournal.astro";
import { journalFixture } from "./fixtures";

const meta = {
  title: "Patterns/Journal",
  component: AmberJournal,
  args: journalFixture,
  parameters: { controls: { disable: true }, amber: { fullPage: true } },
} satisfies Meta<VariantProps>;

export default meta;
export const JournalIndex: StoryObj<VariantProps> = {};
