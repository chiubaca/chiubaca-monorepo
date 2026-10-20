import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import { colourTokens, spacingTokens, typographyRoles } from "./catalog";
import { contrastRatio, readTokens } from "./token-values";

const source = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const tokens = readTokens(source);

describe.each(["light", "dark"] as const)("Amber %s tokens", (mode) => {
  const tokens = readTokens(source, mode);
  it("resolves every documented colour, spacing, and typography token", () => {
    for (const colour of colourTokens) expect(tokens.value(colour.token)).toMatch(/^#[\da-f]{6}$/i);
    for (const space of spacingTokens) expect(tokens.value(space)).toMatch(/rem$/);
    for (const role of typographyRoles) {
      for (const token of [role.font, role.size, role.leading]) {
        expect(tokens.value(token)).not.toContain("var(");
      }
    }
  });

  it("keeps every normal text colour at AA on every paper surface", () => {
    for (const foreground of ["text", "text-muted", "accent", "accent-hover"]) {
      for (const background of ["page", "surface", "surface-muted"]) {
        expect(
          contrastRatio(
            tokens.value(`--amber-color-${foreground}`),
            tokens.value(`--amber-color-${background}`),
          ),
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps selection readable and keyboard focus visible", () => {
    expect(
      contrastRatio(
        tokens.value("--amber-color-selection-text"),
        tokens.value("--amber-color-selection"),
      ),
    ).toBeGreaterThanOrEqual(4.5);
    for (const background of ["page", "surface", "surface-muted"]) {
      for (const foreground of ["focus", "control-border"]) {
        expect(
          contrastRatio(
            tokens.value(`--amber-color-${foreground}`),
            tokens.value(`--amber-color-${background}`),
          ),
        ).toBeGreaterThanOrEqual(3);
      }
    }
    expect(
      contrastRatio(tokens.value("--amber-color-on-accent"), tokens.value("--amber-color-accent")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps plain code and comments readable on the highlighted code surface", () => {
    for (const role of ["code-text", "code-comment"]) {
      expect(
        contrastRatio(
          tokens.value(`--amber-color-${role}`),
          tokens.value("--amber-color-code-background"),
        ),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("reports invalid references instead of silently documenting an empty value", () => {
    expect(() => tokens.value("--amber-missing")).toThrow("Unknown Amber token");
    const circular = readTokens(
      "--amber-first: var(--amber-second); --amber-second: var(--amber-first);",
    );
    expect(() => circular.value("--amber-first")).toThrow("Circular Amber token");
  });
});

describe("Mode-aware token resolution", () => {
  it("resolves light-dark colours and aliases without changing the shared type scale", () => {
    const light = readTokens(source, "light");
    const dark = readTokens(source, "dark");
    expect(light.value("--amber-color-page")).toBe(light.value("--amber-paper-100"));
    expect(dark.value("--amber-color-page")).toBe(dark.value("--amber-moss-950"));
    expect(dark.value("--amber-color-focus")).toBe(dark.value("--amber-honey-400"));
    for (const role of typographyRoles) {
      expect(dark.value(role.size)).toBe(light.value(role.size));
      expect(dark.value(role.font)).toBe(light.value(role.font));
    }
    expect(tokens.value("--amber-color-page")).toBe(light.value("--amber-color-page"));
  });
});

describe("WCAG contrast", () => {
  it("matches the black-and-white reference ratio", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#ffffff", "#000000")).toBe(21);
    expect(contrastRatio("#f7f4ed", "#f7f4ed")).toBe(1);
  });

  it("rejects unsupported colour formats", () => {
    expect(() => contrastRatio("red", "#ffffff")).toThrow("six-digit hex colour");
  });
});
