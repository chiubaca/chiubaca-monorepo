import type { Preview } from "./types";
import { useEffect, useGlobals } from "storybook/preview-api";
import { colorModePreference } from "../src/design-system/color-mode";
import StoryFrame from "./StoryFrame.astro";
import "../src/components/journal/appearance";
import "../src/components/journal/code-copy";
import "../src/components/journal/notation";
import "../src/components/journal/photo-tape";
import "../src/components/journal/rough-table";
import "../src/design-system/index.css";
import "../src/design-system/stories/review.css";

const preview: Preview = {
  initialGlobals: {
    colorMode: "system",
    systemColorMode:
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
  },
  globalTypes: {
    colorMode: {
      description: "Amber Journal colour mode",
      toolbar: {
        icon: "circlehollow",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
      },
    },
  },
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    a11y: { test: "error" },
    options: {
      storySort: {
        order: [
          "Foundations",
          ["Overview", "Colour", "Typography", "Rhythm", "Motion", "Handwriting"],
          "Components",
          "Patterns",
        ],
      },
    },
    viewport: {
      options: {
        smallPhone: { name: "Small phone · 320", styles: { width: "320px", height: "812px" } },
        phone: { name: "Phone · 390", styles: { width: "390px", height: "844px" } },
        tablet: { name: "Tablet · 768", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop · 1440", styles: { width: "1440px", height: "1000px" } },
      },
    },
  },
  decorators: [
    (story, context) => {
      if (typeof document !== "undefined") {
        const [, updateGlobals] = useGlobals();
        useEffect(() => {
          const system = window.matchMedia("(prefers-color-scheme: dark)");
          const update = () =>
            updateGlobals({ systemColorMode: system.matches ? "dark" : "light" });
          const onAppearanceChange = (event: Event) => {
            const { mode, targetId } = (event as CustomEvent).detail;
            if (!targetId) updateGlobals({ colorMode: colorModePreference(mode) });
          };
          update();
          system.addEventListener("change", update);
          document.addEventListener("amber:color-mode-change", onAppearanceChange);
          return () => {
            system.removeEventListener("change", update);
            document.removeEventListener("amber:color-mode-change", onAppearanceChange);
          };
        }, []);

        document.documentElement.dataset.colorMode = colorModePreference(context.globals.colorMode);
      }

      if (
        typeof context.component === "function" &&
        "isAstroComponentFactory" in context.component
      ) {
        return {
          component: StoryFrame,
          props: { title: context.title, fullPage: context.parameters.amber?.fullPage === true },
        };
      }

      const preference = colorModePreference(context.globals.colorMode);
      const wrapper = document.createElement("div");
      wrapper.className = "amber-theme amber-review";
      wrapper.dataset.theme = "amber";
      wrapper.dataset.colorMode = preference;
      const content = story();
      if (typeof content === "string") wrapper.innerHTML = content;
      else wrapper.append(content);
      return wrapper;
    },
  ],
};

export default preview;
