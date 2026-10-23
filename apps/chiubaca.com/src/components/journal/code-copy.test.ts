import { expect, it } from "vite-plus/test";
import { registerCodeCopy } from "./code-copy";

it("can import the code copy entry during Astro prerender without browser globals", () => {
  expect(typeof window).toBe("undefined");
  expect(registerCodeCopy).not.toThrow();
});
