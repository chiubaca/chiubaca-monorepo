import type { AstroRenderer } from "@storybook-astro/framework";
import type {
  Args,
  ComponentAnnotations,
  ProjectAnnotations,
  StoryAnnotations,
} from "storybook/internal/types";

// CSF3 annotations for both the existing HTML references and real Astro stories.
export type Meta<TArgs = Args> = ComponentAnnotations<AstroRenderer, TArgs>;
export type StoryObj<TArgs = Args> = StoryAnnotations<AstroRenderer, TArgs>;
export type Preview = ProjectAnnotations<AstroRenderer>;
