import type { Meta, StoryObj } from "../../../.storybook/types";
import AppearanceExample from "./AppearanceExample.astro";

export default {
  title: "Components/AppearanceSelect",
  component: AppearanceExample,
  parameters: { controls: { disable: true } },
} satisfies Meta;

export const Interactive: StoryObj = {};
