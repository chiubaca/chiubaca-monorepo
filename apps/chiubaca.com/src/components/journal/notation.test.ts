import { expect, it } from "vite-plus/test";
import { registerNotation } from "./notation";

it("can import the rough notation entry during Astro prerender without browser globals", () => {
  expect(typeof window).toBe("undefined");
  expect(registerNotation).not.toThrow();
});
