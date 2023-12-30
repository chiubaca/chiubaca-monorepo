import { z } from "astro/zod";
import { noteTypes } from "./zod-schemas";

export type NoteTypes = z.infer<typeof noteTypes>;

export type SlugPaths = `${NoteTypes}/${string}`;
export type AllPaths = NoteTypes | SlugPaths;
