import type { ColorMode } from "./color-mode";

/** Resolve the deliberately simple declarations in tokens.css for documentation. */
export function readTokens(css: string, mode: ColorMode = "light") {
  const declarations = Object.fromEntries(
    [...css.matchAll(/(--amber-[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );

  function value(name: string, ancestors: string[] = []): string {
    if (!(name in declarations)) throw new Error(`Unknown Amber token: ${name}`);
    if (ancestors.includes(name)) throw new Error(`Circular Amber token: ${name}`);
    const resolved = declarations[name].replace(
      /var\((--amber-[\w-]+)\)/g,
      (_, reference: string) => value(reference, [...ancestors, name]),
    );
    return resolved.replace(
      /light-dark\(\s*(#[\da-f]{6})\s*,\s*(#[\da-f]{6})\s*\)/gi,
      (_, light: string, dark: string) => (mode === "dark" ? dark : light),
    );
  }

  return { declarations, value };
}

/** WCAG 2 relative luminance contrast for the theme's six-digit sRGB colours. */
export function contrastRatio(foreground: string, background: string): number {
  function luminance(hex: string) {
    if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`Expected a six-digit hex colour: ${hex}`);
    const channels = [1, 3, 5].map((index) => {
      const channel = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }

  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
