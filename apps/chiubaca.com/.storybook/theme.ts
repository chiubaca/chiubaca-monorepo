import { create } from "storybook/theming";
import { readTokens } from "../src/design-system/token-values";
import type { ColorMode } from "../src/design-system/color-mode";

export function createAmberStorybookTheme(source: string, mode: ColorMode) {
  const { value } = readTokens(source, mode);

  return create({
    base: mode,
    brandTitle: "chiubaca / Amber Journal",
    brandUrl: "?path=/story/foundations-overview--amber-journal",
    brandTarget: "_self",
    fontBase: value("--amber-font-interface"),
    fontCode: value("--amber-font-code"),
    colorPrimary: value("--amber-color-accent"),
    colorSecondary: value("--amber-color-accent"),
    appBg: value("--amber-color-page"),
    appContentBg: value("--amber-color-page"),
    appPreviewBg: value("--amber-color-page"),
    appBorderColor: value("--amber-color-border"),
    appBorderRadius: 2,
    textColor: value("--amber-color-text"),
    textMutedColor: value("--amber-color-text-muted"),
    textInverseColor: value("--amber-color-on-accent"),
    barBg: value("--amber-color-surface"),
    barTextColor: value("--amber-color-text-muted"),
    barSelectedColor: value("--amber-color-accent"),
    barHoverColor: value("--amber-color-accent-hover"),
    inputBg: value("--amber-color-surface"),
    inputBorder: value("--amber-color-control-border"),
    inputTextColor: value("--amber-color-text"),
    inputBorderRadius: 2,
  });
}
