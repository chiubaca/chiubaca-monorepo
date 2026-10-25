import { expect, it } from "vite-plus/test";
import { registerAppearanceControls } from "./appearance";

it("can import the appearance entry during Astro prerender without browser globals", () => {
  expect(typeof window).toBe("undefined");
  expect(registerAppearanceControls).not.toThrow();
});
