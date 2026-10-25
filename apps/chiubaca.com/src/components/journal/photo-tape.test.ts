import { expect, it } from "vite-plus/test";
import { registerPhotoTape } from "./photo-tape";

it("can import the photo tape entry during Astro prerender without browser globals", () => {
  expect(typeof window).toBe("undefined");
  expect(registerPhotoTape).not.toThrow();
});
