import { describe, expect, it } from "vite-plus/test";
import { colorModePreference, resolveColorMode } from "./color-mode";

describe("Amber colour mode", () => {
  it("follows the system preference when no explicit mode is chosen", () => {
    expect(resolveColorMode("system", true)).toBe("dark");
    expect(resolveColorMode("system", false)).toBe("light");
  });

  it("keeps an explicit choice regardless of the operating system", () => {
    for (const prefersDark of [true, false]) {
      expect(resolveColorMode("light", prefersDark)).toBe("light");
      expect(resolveColorMode("dark", prefersDark)).toBe("dark");
    }
  });

  it("treats missing or invalid stored preferences as system", () => {
    for (const value of [undefined, null, "", "sepia", {}, 1]) {
      expect(colorModePreference(value)).toBe("system");
      expect(resolveColorMode(value, true)).toBe("dark");
    }
  });
});
