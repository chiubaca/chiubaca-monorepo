import { expect, it } from "vite-plus/test";
import { registerRoughTables } from "./rough-table";

it("can import the rough table entry during Astro prerender without browser globals", () => {
  expect(typeof window).toBe("undefined");
  expect(registerRoughTables).not.toThrow();
});
