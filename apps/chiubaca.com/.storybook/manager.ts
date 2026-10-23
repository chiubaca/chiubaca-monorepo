import { addons } from "storybook/manager-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { createAmberStorybookTheme } from "./theme";
import { colorModePreference, resolveColorMode } from "../src/design-system/color-mode";

const source: string = JSON.parse(document.getElementById("amber-token-source")!.textContent!);

const system = window.matchMedia("(prefers-color-scheme: dark)");
let preference = colorModePreference("system");

function applyTheme() {
  const mode = resolveColorMode(preference, system.matches);
  document.documentElement.style.colorScheme = mode;
  addons.setConfig({ theme: createAmberStorybookTheme(source, mode) });
}

applyTheme();
system.addEventListener("change", applyTheme);
// Before initialization getChannel() can return a temporary, disconnected channel.
void addons.ready().then((channel) => {
  channel.on(GLOBALS_UPDATED, ({ globals }) => {
    preference = colorModePreference(globals.colorMode);
    applyTheme();
  });
});
