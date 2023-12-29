import { z } from "astro/zod";

export const noteTypes = z.enum([
  "fleeting-notes",
  "index-notes",
  "literature-notes",
  "permanent-notes",
]);
export type NoteTypes = z.infer<typeof noteTypes>;

export type SlugPaths = `${NoteTypes}/${string}`;
export type AllPaths = NoteTypes | SlugPaths;
