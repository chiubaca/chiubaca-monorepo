export type ColorMode = "light" | "dark";
export type ColorModePreference = ColorMode | "system";

export function colorModePreference(value: unknown): ColorModePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function resolveColorMode(preference: unknown, prefersDark: boolean): ColorMode {
  const mode = colorModePreference(preference);
  return mode === "system" ? (prefersDark ? "dark" : "light") : mode;
}
