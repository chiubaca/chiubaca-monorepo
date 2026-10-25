import { describe, expect, it } from "vite-plus/test";
import { createHeroDoodles } from "./hero-doodles";

describe("permanent note hero doodles", () => {
  it("generates stars, scribbles, and squiggles without browser globals", () => {
    expect(typeof window).toBe("undefined");
    const doodles = createHeroDoodles("Leaning into the vibes");
    expect(doodles).toHaveLength(13);
    expect(new Set(doodles.map((doodle) => doodle.kind))).toEqual(
      new Set(["star", "scribble", "squiggle"]),
    );
    for (const doodle of doodles) {
      expect(doodle.paths).toHaveLength(1);
      for (const path of doodle.paths) {
        expect(path.d).toMatch(/^M/);
        expect(path.d.match(/M/g)).toHaveLength(1);
        expect(path.d).not.toMatch(/NaN|Infinity/);
        expect(path.stroke).toBe("currentColor");
      }
    }
  });

  it("keeps each article’s random marks stable across renders", () => {
    expect(createHeroDoodles("Skill-stacking")).toEqual(createHeroDoodles("Skill-stacking"));
    expect(createHeroDoodles("Skill-stacking")).not.toEqual(createHeroDoodles("4am Hugs"));
  });

  it("keeps the middle-left reading area clear of doodle centres", () => {
    for (const key of ["", "Leaning into the vibes", "4am Hugs", "星"]) {
      for (const doodle of createHeroDoodles(key)) {
        expect(doodle.x).toBeGreaterThan(0);
        expect(doodle.x).toBeLessThan(100);
        expect(doodle.y).toBeGreaterThan(0);
        expect(doodle.y).toBeLessThan(100);
        expect(doodle.x > 12 && doodle.x < 60 && doodle.y > 30 && doodle.y < 70).toBe(false);
      }
    }
  });

  it("replaces the three faces with abstract squiggles", () => {
    const doodles = createHeroDoodles("A page from the journal");
    const squiggles = doodles.filter((doodle) => doodle.kind === "squiggle");
    expect(squiggles).toHaveLength(3);
    for (const squiggle of squiggles) expect(squiggle.paths.length).toBeGreaterThan(0);
    expect(doodles.map((doodle) => doodle.kind)).not.toContain("smiley");
  });

  it("draws rough.js stars as one continuous pen stroke", () => {
    const stars = createHeroDoodles("A page from the journal").filter(
      (doodle) => doodle.kind === "star",
    );
    for (const star of stars) {
      expect(star.paths).toHaveLength(1);
      expect(star.paths.every((path) => (path.d.match(/M/g) ?? []).length === 1)).toBe(true);
    }
  });
});
